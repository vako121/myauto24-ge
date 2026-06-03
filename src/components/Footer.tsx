import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">myauto24.ge</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              საქართველოს №1 ავტომობილების ყიდვა-გაყიდვის პლატფორმა.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">მენიუ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>მთავარი</li>
              <li>განცხადებები</li>
              <li>VIP პაკეტები</li>
              <li>ჩვენ შესახებ</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">დახმარება</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>როგორ ვიყიდო</li>
              <li>როგორ გავყიდო</li>
              <li>უსაფრთხოება</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">კონტაქტი</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>+995 555 60 85 64</li>
              <li>info@myauto24.ge</li>
              <li>თბილისი, საქართველო</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} myauto24.ge — ყველა უფლება დაცულია.
        </div>
      </div>
    </footer>
  );
}
