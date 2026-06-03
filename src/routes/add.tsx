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
  makeModels,
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
  contact_name: "",
  contact_phone: "",
};

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "განცხადების დამატება — myauto24.ge" },
      {
        name: "description",
        content: "დაამატე შენი ავტომობილის განცხადება უფასოდ ან აირჩიე VIP პაკეტი.",
      },
    ],
  }),
  component: AddPage,
});

function AddPage() {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState("free");
  const [form, setForm] = useState<FormState>(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("display_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm((current) => ({
          ...current,
          contact_name: current.contact_name || data.display_name || "",
          contact_phone: current.contact_phone || data.phone || "",
        }));
      });
  }, [user]);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadPhotos = async (userId: string) => {
    if (photos.length === 0) {
      throw new Error("გთხოვ ატვირთე ავტომობილის მინიმუმ ერთი ფოტო.");
    }

    const urls = await Promise.all(
      photos.map(async (photo) => {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("car-photos").upload(path, photo, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) throw error;

        const { data } = supabase.storage.from("car-photos").getPublicUrl(path);
        return data.publicUrl;
      }),
    );

    return urls[0];
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    if (
      !form.make ||
      !form.fuel ||
      !form.transmission ||
      !form.city ||
      !form.drive ||
      !form.contact_phone
    ) {
      toast.error("გთხოვ შეავსო ყველა სავალდებულო ველი.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrl = await uploadPhotos(user.id);
      const vip = pkg === "free" ? null : (pkg as Exclude<VipPackage, null>);
      const { data, error } = await supabase
        .from("listings")
        .insert({
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
          image_url: imageUrl,
          contact_name: form.contact_name,
        contact_phone: form.contact_phone,
          user_id: user.id,
          vip,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("განცხადება წარმატებით დაემატა!");
      await navigate({ to: "/car/$id", params: { id: data.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "განცხადების დამატება ვერ მოხერხდა.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">საჭიროა ავტორიზაცია</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              განცხადების დასამატებლად საჭიროა შესვლა ან რეგისტრაცია. რეგისტრაცია მარტივი და უფასოა.
            </p>
            <Button asChild size="lg" className="mt-6 w-full gap-2">
              <Link to="/auth">
                <LogIn className="h-4 w-4" /> შესვლა / რეგისტრაცია
              </Link>
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

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">დაამატე განცხადება</h1>
        <p className="mt-2 text-muted-foreground">
          შეავსე ფორმა და გაყიდე შენი ავტომობილი სწრაფად.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">ძირითადი ინფორმაცია</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="მწარმოებელი">
                  <Select
                    required
                    value={form.make}
                    onValueChange={(value) => update("make", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="აირჩიე" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
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
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    placeholder="2020"
                  />
                </Field>
                <Field label="ფასი ($)">
                  <Input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="20000"
                  />
                </Field>
                <Field label="გარბენი (კმ)">
                  <Input
                    type="number"
                    required
                    value={form.mileage}
                    onChange={(e) => update("mileage", e.target.value)}
                    placeholder="50000"
                  />
                </Field>
                <Field label="ფერი">
                  <Input
                    required
                    value={form.color}
                    onChange={(e) => update("color", e.target.value)}
                    placeholder="თეთრი"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">ტექნიკური მახასიათებლები</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="საწვავი">
                  <Select
                    required
                    value={form.fuel}
                    onValueChange={(value) => update("fuel", value)}
                  >
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
                <Field label="ძრავა">
                  <Input
                    required
                    value={form.engine}
                    onChange={(e) => update("engine", e.target.value)}
                    placeholder="მაგ. 2.5L"
                  />
                </Field>
                <Field label="წამყვანი">
                  <Select
                    required
                    value={form.drive}
                    onValueChange={(value) => update("drive", value)}
                  >
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
                <Field label="ქალაქი">
                  <Select
                    required
                    value={form.city}
                    onValueChange={(value) => update("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="აირჩიე" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="აღწერა">
                  <Textarea
                    required
                    rows={5}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="დამატებითი ინფორმაცია მანქანის შესახებ..."
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">ფოტოები</h2>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors hover:border-primary hover:bg-primary/5">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">ატვირთე ფოტოები</p>
                <p className="text-xs text-muted-foreground">
                  {photos.length > 0 ? `${photos.length} ფოტო არჩეულია` : "მაქს. 10 ფოტო, JPG/PNG"}
                </p>
                <input
                  type="file"
                  multiple
                  required
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 10))}
                />
              </label>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">საკონტაქტო</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="სახელი">
                  <Input
                    required
                    value={form.contact_name}
                    onChange={(e) => update("contact_name", e.target.value)}
                    placeholder="გიორგი"
                  />
                </Field>
                <Field label="ტელეფონი">
                  <Input
                    required
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => update("contact_phone", e.target.value)}
                    placeholder="+995 555 12 34 56"
                  />
                  <Input required placeholder="გიორგი" />
                </Field>
                <Field label="ტელეფონი">
                  <Input required type="tel" placeholder="+995 555 12 34 56" />
                </Field>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold">აირჩიე პაკეტი</h3>
              <div className="mt-4 space-y-3">
                {packages.map((p) => {
                  const active = pkg === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPkg(p.id)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${active ? `${p.color} bg-primary/5` : "border bg-background hover:border-primary/40"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p.icon className="h-4 w-4" />
                          <span className="font-semibold">{p.name}</span>
                        </div>
                        <span className="text-sm font-bold">
                          {p.price === 0 ? "უფასო" : `$${p.price}`}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {p.perks.map((x) => (
                          <li key={x}>• {x}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ქვეყნდება...
                  </>
                ) : (
                  "გამოქვეყნება"
                )}
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                გამოქვეყნებით ეთანხმები წესებს და პირობებს
              </p>
            </div>
          </aside>
        </form>
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
