import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Car, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "შესვლა / რეგისტრაცია — myauto24.ge" },
      {
        name: "description",
        content: "შედი ან გაიარე რეგისტრაცია myauto24.ge-ზე.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // SignIn
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail,
      password: siPass,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("წარმატებით შეხვედი!");
  };

  // SignUp
  const [name, setName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [phone, setPhone] = useState("");
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPass,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name, phone },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: name,
        phone,
      });
    }

    toast.success(
      data.session
        ? "რეგისტრაცია წარმატებულია! ახლა შეგიძლია განცხადების დამატება."
        : "რეგისტრაცია წარმატებულია! შეამოწმე ელფოსტა დადასტურებისთვის.",
    );

    if (data.session) {
      await navigate({ to: "/add" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold">
            myauto24<span className="text-primary">.ge</span>
          </span>
        </Link>

        <Card className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">შესვლა</TabsTrigger>
              <TabsTrigger value="signup">რეგისტრაცია</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">ელფოსტა</Label>
                  <Input
                    id="si-email"
                    type="email"
                    required
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pass">პაროლი</Label>
                  <Input
                    id="si-pass"
                    type="password"
                    required
                    value={siPass}
                    onChange={(e) => setSiPass(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                  შესვლა
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">სახელი</Label>
                  <Input
                    id="su-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">ელფოსტა</Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-phone">ტელეფონი</Label>
                  <Input
                    id="su-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+995 555 12 34 56"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass">პაროლი</Label>
                  <Input
                    id="su-pass"
                    type="password"
                    minLength={6}
                    required
                    value={suPass}
                    onChange={(e) => setSuPass(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                  რეგისტრაცია
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
