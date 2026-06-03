import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "კონტაქტი — myauto24.ge" },
      { name: "description", content: "დაგვიკავშირდი — myauto24.ge-ის მხარდაჭერის გუნდი მზად არის დაგეხმაროს." },
    ],
  }),
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-bold">კონტაქტი</h1>
        <p className="mt-2 text-muted-foreground">დაგვიკავშირდი ნებისმიერ კითხვაზე</p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            {[
              { i: Phone, k: "ტელეფონი", v: "+995 555 12 34 56" },
              { i: Mail, k: "ელ-ფოსტა", v: "info@myauto24.ge" },
              { i: MapPin, k: "მისამართი", v: "თბილისი, საქართველო" },
            ].map((c) => (
              <div key={c.k} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.i className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{c.k}</div>
                  <div className="font-semibold">{c.v}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            className="space-y-4 rounded-2xl border bg-card p-6"
            onSubmit={(e) => { e.preventDefault(); toast.success("შეტყობინება გაიგზავნა!"); }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>სახელი</Label><Input required /></div>
              <div className="space-y-1.5"><Label>ელ-ფოსტა</Label><Input required type="email" /></div>
            </div>
            <div className="space-y-1.5"><Label>თემა</Label><Input required /></div>
            <div className="space-y-1.5"><Label>შეტყობინება</Label><Textarea required rows={5} /></div>
            <Button type="submit" size="lg" className="w-full">გაგზავნა</Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  ),
});
