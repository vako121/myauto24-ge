import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Rocket } from "lucide-react";
import type { Car } from "@/lib/mock-cars";

const vipBorder: Record<string, string> = {
  super: "ring-2 ring-primary/40",
  vip: "ring-1 ring-amber-400/40",
  color: "ring-1 ring-emerald-400/40",
};

export function CarCard({ car }: { car: Car }) {
  return (
    <Link
      to="/car/$id"
      params={{ id: car.id }}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${car.vip ? vipBorder[car.vip] : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={car.image}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {car.vip === "super" && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
            <Rocket className="h-3 w-3" /> Super VIP
          </span>
        )}
        {car.vip === "vip" && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            VIP
          </span>
        )}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2.5 top-2.5 rounded-full bg-background/90 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
          aria-label="რჩეულებში"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {car.city}
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold leading-snug">
            {car.year} – {car.make} {car.model}
          </h3>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="რჩეული"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="text-lg font-bold text-foreground">
          {car.price.toLocaleString()} <span className="text-base">₾</span>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {car.drive === "4x4" ? "ჯიპი" : "სედანი"}
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {car.fuel}
          </span>
        </div>
      </div>
    </Link>
  );
}
