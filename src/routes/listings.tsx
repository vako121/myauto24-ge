import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarCard } from "@/components/CarCard";
import { AdBanner } from "@/components/AdBanner";
import { Fragment } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { fetchCars, makes, cities, type Car } from "@/lib/mock-cars";
import { supabase } from "@/integrations/supabase/client";
type Search = {
  make?: string;
  model?: string;
  city?: string;
  maxPrice?: number;
};

export const Route = createFileRoute("/listings")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    make: typeof s.make === "string" ? s.make : undefined,
    model: typeof s.model === "string" ? s.model : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : undefined,
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
  head: () => ({
    meta: [
      { title: "ყველა განცხადება — myauto24.ge" },
      {
        name: "description",
        content:
          "ათასობით ავტომობილის განცხადება — გაფილტრე მწარმოებლის, ფასის, წლისა და ქალაქის მიხედვით.",
      },
    ],
  }),
  component: ListingsPage,
});

function ListingsPage() {
  const cars = Route.useLoaderData();
  const initial = Route.useSearch();
  const [make, setMake] = useState(initial.make ?? "all");
  const [city, setCity] = useState(initial.city ?? "all");
  const [fuel, setFuel] = useState("all");
  const [sort, setSort] = useState<"new" | "price-asc" | "price-desc">("new");
  const [query, setQuery] = useState(initial.model ?? "");
  const [price, setPrice] = useState<number[]>([0, initial.maxPrice ?? 100000]);

  const filtered = useMemo(() => {
    let result: Car[] = cars.filter((c) => {
      if (make !== "all" && c.make !== make) return false;
      if (city !== "all" && c.city !== city) return false;
      if (fuel !== "all" && c.fuel !== fuel) return false;
      if (c.price < price[0] || c.price > price[1]) return false;
      if (query && !`${c.make} ${c.model}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
   else result = [...result].sort((a, b) =>
  (b.created_at ?? "").localeCompare(a.created_at ?? "")
);
    // VIP first
    return [...result].sort((a, b) => {
      const rank = (v: Car["vip"]) => (v === "super" ? 3 : v === "vip" ? 2 : v === "color" ? 1 : 0);
      return rank(b.vip) - rank(a.vip);
    });
  }, [cars, make, city, fuel, sort, query, price]);

  const reset = () => {
    setMake("all");
    setCity("all");
    setFuel("all");
    setQuery("");
    setPrice([0, 100000]);
    setSort("new");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">ფილტრები</h2>
            <Button variant="ghost" size="sm" onClick={reset}>
              გასუფთავება
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                ძებნა
              </label>
              <Input
                placeholder="მოდელი..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                მწარმოებელი
              </label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                ქალაქი
              </label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                საწვავი
              </label>
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  <SelectItem value="ბენზინი">ბენზინი</SelectItem>
                  <SelectItem value="დიზელი">დიზელი</SelectItem>
                  <SelectItem value="ჰიბრიდი">ჰიბრიდი</SelectItem>
                  <SelectItem value="ელექტრო">ელექტრო</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">ფასი</span>
                <span className="font-semibold">
                  ${price[0].toLocaleString()} – ${price[1].toLocaleString()}
                </span>
              </div>
              <Slider min={0} max={100000} step={1000} value={price} onValueChange={setPrice} />
            </div>
          </div>
        </aside>

        <main>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              ნაპოვნია <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              განცხადება
            </p>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">თარიღი: ახლები</SelectItem>
                <SelectItem value="price-asc">ფასი: ზრდადობით</SelectItem>
                <SelectItem value="price-desc">ფასი: კლებადობით</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              მითითებული პარამეტრებით განცხადება ვერ მოიძებნა.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c, i) => (
                <Fragment key={c.id}>
                  <CarCard car={c} />
                  {(i + 1) % 6 === 0 && (
                    <div className="sm:col-span-2 xl:col-span-3">
                      <AdBanner
                        variant="wide"
                        title="🔧 ავტო სერვისი — TOP ხარისხი"
                        subtitle="პარტნიორი სერვის ცენტრი — დათვალიერება უფასოდ"
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
