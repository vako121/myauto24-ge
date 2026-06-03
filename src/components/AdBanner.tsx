import { X } from "lucide-react";
import { useState } from "react";

type Variant = "wide" | "square" | "skyscraper";

const dims: Record<Variant, string> = {
  wide: "aspect-[8/1] sm:aspect-[10/1]",
  square: "aspect-[3/2]",
  skyscraper: "aspect-[3/4]",
};

export function AdBanner({
  variant = "wide",
  title = "თქვენი რეკლამა აქ",
  subtitle = "დაუკავშირდი — ads@myauto24.ge",
  href = "#",
  closable = false,
  imageUrl,
}: {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  href?: string;
  closable?: boolean;
  imageUrl?: string;
}) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="relative my-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-r from-primary/5 via-amber-50 to-primary/5 ${dims[variant]}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center px-4 text-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">სარეკლამო ადგილი</span>
            <p className="mt-1 text-sm font-semibold text-foreground sm:text-base md:text-lg">{title}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-md bg-background/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          Ad
        </span>
      </a>
      {closable && (
        <button
          onClick={() => setHidden(true)}
          className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
          aria-label="დახურვა"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
