import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  cities,
  modelsByMake,
  makes,
  type Drive,
  type Fuel,
  type Transmission,
} from "@/lib/mock-cars";
import { toast } from "sonner";
type FormState = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  fuel: Fuel | "";
  transmission: Transmission | "";
  city: string;
  engine: string;
  drive: Drive | "";
  color: string;
  description: string;
};

const initialForm: FormState = {
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  fuel: "",
  transmission: "",
  city: "",
  engine: "",
  drive: "",
  color: "",
  description: "",
};

export const Route = createFileRoute("/edit/$id")({
  head: () => ({ meta: [{ title: "განცხადების რედაქტირება — myauto24.ge" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingListing, setLoadingListing] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedModels = form.make ? (makeModels[form.make] ?? []) : [];

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    setLoadingListing(true);
    supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoadingListing(false);
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!data) {
          toast.error("განცხადება ვერ მოიძებნა ან შენ არ ხარ მისი მფლობელი.");
          navigate({ to: "/profile" });
          return;
        }
        setForm({
          make: data.make,
          model: data.model,
          year: String(data.year),
          price: String(Number(data.price)),
          mileage: String(data.mileage),
          fuel: data.fuel as Fuel,
          transmission: data.transmission as Transmission,
          city: data.city,
          engine: data.engine,
          drive: data.drive as Drive,
          color: data.color,
          description: data.description,
        });
      });
  }, [id, navigate, user]);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "make" ? { model: "" } : {}),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    const { error } = await supabase
      .from("listings")
      .update({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        fuel: form.fuel,
        transmission: form.transmission,
        city: form.city,
        engine: form.engine,
        drive: form.drive,
        color: form.color,
        description: form.description,
      })
      .eq("id", id)
      .eq("user_id", user.id);
    setSaving(false);

    if (error) return toast.error(error.message);

    toast.success("განცხადება განახლდა.");
    await navigate({ to: "/car/$id", params: { id } });
  };

  if (loading || loadingListing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-16 text-center">
          <div className="rounded-2xl border bg-card p-8">
            <Lock className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">საჭიროა ავტორიზაცია</h1>
            <Button asChild className="mt-6">
              <Link to="/auth">შესვლა</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
          <Link to="/profile">
            <ArrowLeft className="h-4 w-4" /> პროფილში დაბრუნება
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">განცხადების რედაქტირება</h1>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="მწარმოებელი">
              <Select required value={form.make} onValueChange={(value) => update("make", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="მოდელი">
              <Select
                required
                value={form.model}
                onValueChange={(value) => update("model", value)}
                disabled={!form.make}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={form.make ? "აირჩიე მოდელი" : "ჯერ აირჩიე მწარმოებელი"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="წელი">
              <Input
                required
                type="number"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
              />
            </Field>
            <Field label="ფასი ($)">
              <Input
                required
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </Field>
            <Field label="გარბენი (კმ)">
              <Input
                required
                type="number"
                value={form.mileage}
                onChange={(e) => update("mileage", e.target.value)}
              />
            </Field>
            <Field label="ფერი">
              <Input
                required
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
              />
            </Field>
            <Field label="საწვავი">
              <Select required value={form.fuel} onValueChange={(value) => update("fuel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ბენზინი">ბენზინი</SelectItem>
                  <SelectItem value="დიზელი">დიზელი</SelectItem>
                  <SelectItem value="ჰიბრიდი">ჰიბრიდი</SelectItem>
                  <SelectItem value="ელექტრო">ელექტრო</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="ტრანსმისია">
              <Select
                required
                value={form.transmission}
                onValueChange={(value) => update("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ავტომატიკა">ავტომატიკა</SelectItem>
                  <SelectItem value="მექანიკა">მექანიკა</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="ქალაქი">
              <Select required value={form.city} onValueChange={(value) => update("city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="ძრავა">
              <Input
                required
                value={form.engine}
                onChange={(e) => update("engine", e.target.value)}
              />
            </Field>
            <Field label="წამყვანი">
              <Select required value={form.drive} onValueChange={(value) => update("drive", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიე" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="წინა">წინა</SelectItem>
                  <SelectItem value="უკანა">უკანა</SelectItem>
                  <SelectItem value="4x4">4x4</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="აღწერა">
            <Textarea
              required
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} შენახვა
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
