import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Phone,
  MessageCircle,
  Heart,
  Cog,
  Palette,
    ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCarById } from "@/lib/mock-cars";

export const Route = createFileRoute("/car/$id")({
  loader: async ({ params }) => {
    const car = await fetchCarById(params.id);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "განცხადება — myauto24.ge" }] };
    const { car } = loaderData;
    const title = `${car.make} ${car.model} ${car.year} — $${car.price.toLocaleString()} | myauto24.ge`;
    const description =
      car.description?.slice(0, 200) ??
      `${car.make} ${car.model} ${car.year}, ${car.mileage.toLocaleString()} კმ, ${car.city}`;
    const url = `https://sakartvelo-motors.lovable.app/car/${params.id}`;
    const image = car.image?.startsWith("http")
      ? car.image_url
      : `https://sakartvelo-motors.lovable.app${car.image_url}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "product:price:amount", content: String(car.price) },
        { property: "product:price:currency", content: "USD" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${car.make} ${car.model} ${car.year}`,
            description,
            image,
            offers: {
              "@type": "Offer",
              price: car.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">განცხადება ვერ მოიძებნა</h1>
        <Button asChild className="mt-6">
          <Link to="/listings">ყველა განცხადება</Link>
        </Button>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-8">
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
  component: CarPage,
});

function normalizePhone(phone?: string | null) {
  return phone?.replace(/[^\d+]/g, "") ?? "";
}

function whatsappPhone(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) return "";
  return normalized.startsWith("+") ? normalized.slice(1) : normalized;
}

function CarPage() {
  const [showImage, setShowImage] = useState(false);
  const { car } = Route.useLoaderData();
  const galleryImages = car.image_urls?.length
  ? car.image_urls
  : [car.image_url];
const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const phone = car.contact_phone?.trim();
  const phoneHref = phone ? `tel:${normalizePhone(phone)}` : undefined;
  const whatsappHref = phone
   ? `https://wa.me/${whatsappPhone(phone)}?text=${encodeURIComponent(`გამარჯობა, მაინტერესებს ${car.make} ${car.model} განცხადება myauto24.ge-ზე.`)}`

    : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
          <Link to="/listings">
            <ArrowLeft className="h-4 w-4" /> უკან
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border bg-muted">
      <img
  src={activeImage}
  alt={`${car.make} ${car.model}`}
  className="aspect-[16/10] w-full object-cover cursor-pointer"
  onClick={() => setShowImage(true)}
/>
            </div>
            {galleryImages.length > 1 && (
  <div className="mt-3 grid grid-cols-4 gap-2">
    {galleryImages.map((image, index) => (
      <img
        key={index}
        src={image}
        alt={`photo-${index}`}
        className="aspect-square w-full cursor-pointer rounded-lg object-cover border"
        onClick={() => setActiveImage(image)}
      />
    ))}
  </div>
)}
          
            {showImage && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    onClick={() => setShowImage(false)}
  >
    <img
  src={activeImage}
  alt={`${car.make} ${car.model}`}
  className="max-h-screen max-w-screen"
/>
  </div>
)}

            <div className="mt-6 rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">აღწერა</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{car.description}</p>
            </div>

            <div className="mt-6 rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">მახასიათებლები</h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {[
                  { icon: Calendar, k: "წელი", v: car.year },
                  { icon: Gauge, k: "გარბენი", v: `${car.mileage.toLocaleString()} კმ` },
                  { icon: Fuel, k: "საწვავი", v: car.fuel },
                  { icon: Cog, k: "ტრანსმისია", v: car.transmission },
                  { icon: Cog, k: "ძრავა", v: car.engine },
                  { icon: Cog, k: "წამყვანი", v: car.drive },
                  { icon: Palette, k: "ფერი", v: car.color },
                  { icon: MapPin, k: "ქალაქი", v: car.city },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="flex items-center gap-2 rounded-lg border bg-background p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">{s.k}</dt>
                      <dd className="text-sm font-semibold">{s.v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              {car.vip && (
                <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  {car.vip === "super" ? "SUPER VIP" : car.vip === "vip" ? "VIP" : "ფერადი"}
                </Badge>
              )}
              <h1 className="text-2xl font-bold">
                {car.make} {car.model}
              </h1>
              <p className="text-sm text-muted-foreground">
                {car.year} • {car.engine}
              </p>

              <div className="mt-4 text-4xl font-bold text-primary">
                ${car.price.toLocaleString()}
              </div>

              <div className="mt-6 space-y-2">
                {car.contact_name && (
                  <p className="text-center text-sm font-medium text-muted-foreground">
                    გამყიდველი: {car.contact_name}
                  </p>
                )}
                <Button asChild className="w-full gap-2" size="lg">
                 <a href={phoneHref}>
                    <Phone className="h-4 w-4" /> {car.contact_phone || "ნომერი არ არის მითითებული"}
                  </a>
                </Button>
              <Button
  asChild
  className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white"
  size="lg"
>
  <a
    href={whatsappHref}
    target="_blank"
    rel="noopener noreferrer"
  >
    <MessageCircle className="h-4 w-4" />
    WhatsApp-ზე მიწერა
  </a>
</Button>
                <Button variant="ghost" className="w-full gap-2" size="lg">
                  <Heart className="h-4 w-4" /> რჩეულებში
                </Button>
              </div>

              
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
