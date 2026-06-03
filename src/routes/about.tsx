import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "ჩვენ შესახებ — myauto24.ge" },
      { name: "description", content: "myauto24.ge — საქართველოში ავტომობილების ყიდვა-გაყიდვის თანამედროვე პლატფორმა." },
    ],
  }),
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold">ჩვენ შესახებ</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          myauto24.ge არის თანამედროვე პლატფორმა საქართველოში ავტომობილების უსაფრთხო და სწრაფი ყიდვა-გაყიდვისთვის.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { n: "10K+", l: "აქტიური განცხადება" },
            { n: "50K+", l: "მომხმარებელი" },
            { n: "5K+", l: "წარმატებული გარიგება" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-6 text-center">
              <div className="text-3xl font-bold text-primary">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  ),
});
