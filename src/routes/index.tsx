import { Fragment, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Car as CarIcon,
  Truck,
  Bike,
  SlidersHorizontal,
  Rocket,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarCard } from "@/components/CarCard";
import { AdBanner } from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allModels, fetchCars, getModelsForMake, makes, cities } from "@/lib/mock-cars";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "myauto24.ge — ავტომობილების ყიდვა-გაყიდვა საქართველოში" },
      {
        name: "description",
        content:
          "იპოვე ან გაყიდე ავტომობილი myauto24.ge-ზე — ათასობით განცხადება, VIP შეთავაზებები და უსაფრთხო გარიგებები.",
      },
      { property: "og:title", content: "myauto24.ge — №1 ავტო პლატფორმა საქართველოში" },
      {
        property: "og:description",
        content: "ათასობით ავტომობილი, VIP შეთავაზებები, უსაფრთხო გარიგებები.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: async () => {
  const { data, error } = await supabase
    .from("listings")
    .select("*");
  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
},
  component: HomePage,
});

function HomePage() {
  const cars = Route.useLoaderData();
  const [tab, setTab] = useState<"cars" | "spec" | "moto">("cars");
  const [make, setMake] = useState("all");
  const [model, setModel] = useState("all");
  const [city, setCity] = useState("all");

  const selectedModels = make === "all" ? allModels : getModelsForMake(make);
  const searchCount = cars.filter((c) => {
    if (make !== "all" && c.make !== make) return false;
    if (model !== "all" && c.model !== model) return false;
    if (city !== "all" && c.city !== city) return false;
    return true;
  }).length;

  const superVip = cars.filter((c) => c.vip === "super").slice(0, 8);
  const vipCars = cars.filter((c) => c.vip === "vip").slice(0, 8);
  const latest = [...cars].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      {/* Hero with filter card */}
      <section className="border-b bg-gradient-to-b from-background to-muted/40 pb-8 pt-6 md:pt-10">
        <div className="container mx-auto px-4">
          {/* Filter toggle pills */}
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border bg-background p-1 shadow-sm">
            <button className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
              <SlidersHorizontal className="h-3.5 w-3.5" /> ფილტრები
            </button>
            <button className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Myauto AI
              <span className="absolute -right-1 -top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground">
                ბეტა
              </span>
            </button>
          </div>

          {/* Filter card */}
          <div className="mx-auto max-w-5xl rounded-2xl border bg-background p-4 shadow-lg md:p-6">
            {/* Mode tabs */}
            <div className="mb-5 flex flex-wrap gap-1">
              {[
                { k: "cars", label: "ავტომობილები", icon: CarIcon },
                { k: "spec", label: "სპეცტექნიკა", icon: Truck },
                { k: "moto", label: "მოტოტექნიკა", icon: Bike },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k as typeof tab)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    tab === t.k
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filter grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                value={make}
                onValueChange={(value) => {
                  setMake(value);
                  setModel("all");
                }}
              >
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="მწარმოებელი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა მწარმოებელი</SelectItem>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="მოდელი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა მოდელი</SelectItem>
                  {selectedModels.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="მდებარეობა" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა ქალაქი</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="წელი" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022, 2021, 2020, 2019].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="ფასი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10000">0 – 10,000 ₾</SelectItem>
                  <SelectItem value="10000-30000">10,000 – 30,000 ₾</SelectItem>
                  <SelectItem value="30000-60000">30,000 – 60,000 ₾</SelectItem>
                  <SelectItem value="60000-999999">60,000 ₾+</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="ტიპი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">სედანი</SelectItem>
                  <SelectItem value="suv">ჯიპი</SelectItem>
                  <SelectItem value="hatch">ჰეჩბექი</SelectItem>
                  <SelectItem value="coupe">კუპე</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bottom row */}
            <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/listings"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="h-4 w-4" /> დამატებითი ფილტრები
              </Link>
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 rounded-xl px-8 text-base font-semibold shadow-md"
              >
                <Link
                  to="/listings"
                  search={{
                    make: make !== "all" ? make : undefined,
                    model: model !== "all" ? model : undefined,
                    city: city !== "all" ? city : undefined,
                  }}
                >
                  <Search className="h-4 w-4" />
                  ძებნა <span className="opacity-80">({searchCount})</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SUPER VIP */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Rocket className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">SUPER VIP</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link to="/listings">
              ყველა <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {superVip.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      </section>

      {/* Ad banner */}
      <section className="container mx-auto px-4 pb-6">
        <AdBanner
          variant="wide"
          title="💳 ავტო სესხი 0% საკომისიოთი"
          subtitle="პარტნიორი ბანკი — შეავსე განაცხადი 2 წუთში"
        />
      </section>

      {/* VIP */}
      <section className="container mx-auto px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Rocket className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">VIP</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link to="/listings">
              ყველა <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {vipCars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">ახალი განცხადებები</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link to="/listings">
              ყველა <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {latest.map((c, i) => (
            <Fragment key={c.id}>
              <CarCard car={c} />
              {i === 3 && (
                <div className="col-span-2 md:col-span-3 lg:col-span-4">
                  <AdBanner
                    variant="wide"
                    title="🚗 დააზღვიე შენი ავტომობილი ერთ წუთში"
                    subtitle="პარტნიორი სადაზღვევო — 20% ფასდაკლება"
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
