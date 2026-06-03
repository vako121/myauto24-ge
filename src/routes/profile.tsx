import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { type Car } from "@/lib/mock-cars";
import { toast } from "sonner";
import { Edit, LogOut, User as UserIcon, Plus, Loader2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "ჩემი პროფილი — myauto24.ge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [listings, setListings] = useState<Car[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setPhone(data.phone ?? "");
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setListingsLoading(true);
    supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setListingsLoading(false);
        if (error) {
          toast.error(error.message);
          return;
        }
       setListings((data ?? []) as Car[]);
      });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("შენახულია!");
  };

  const deleteListing = async (id: string) => {
    if (!window.confirm("ნამდვილად გსურს განცხადების წაშლა?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("listings").delete().eq("id", id).eq("user_id", user.id);
    setDeletingId(null);

    if (error) return toast.error(error.message);

    setListings((current) => current.filter((listing) => listing.id !== id));
    toast.success("განცხადება წაიშალა.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ჩემი პროფილი</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>სახელი</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ტელეფონი</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+995 555 12 34 56"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} შენახვა
            </Button>
          </form>
        </Card>

        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">ჩემი განცხადებები</h2>
              <p className="text-sm text-muted-foreground">
                აქ შეგიძლია ნახო, დაარედაქტირო ან წაშალო შენი განცხადებები.
              </p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link to="/add">
                <Plus className="h-4 w-4" /> დამატება
              </Link>
            </Button>
          </div>

          {listingsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> იტვირთება...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              ჯერ განცხადება არ გაქვს დამატებული.
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
                >
                  <Link
                    to="/car/$id"
                    params={{ id: listing.id }}
                    className="flex flex-1 items-center gap-3"
                  >
                    <img
                      src={listing.image}
                      alt={`${listing.make} ${listing.model}`}
                      className="h-20 w-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {listing.year} {listing.make} {listing.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {listing.city} • ${listing.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex gap-2 sm:shrink-0">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link to="/edit/$id" params={{ id: listing.id }}>
                        <Edit className="h-4 w-4" /> რედაქტირება
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      disabled={deletingId === listing.id}
                      onClick={() => deleteListing(listing.id)}
                    >
                      {deletingId === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      წაშლა
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-12 justify-start gap-2">
            <Link to="/add">
              <Plus className="h-4 w-4" /> ახალი განცხადება
            </Link>
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="h-12 justify-start gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> გასვლა
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
