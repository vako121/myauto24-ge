import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, User, Search, Menu, Home, Heart, Globe, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const secondaryNav = [
  { to: "/listings", label: "განცხადებები" },
  { to: "/listings", label: "გაქირავება" },
  { to: "/listings", label: "აუქციონი" },
  { to: "/listings", label: "VIN შემოწმება" },
  { to: "/listings", label: "დილერები" },
  { to: "/listings", label: "ავტოსალონები" },
  { to: "https://autonawilebi.ge", label: "ავტონაწილები" },
  { to: "/listings", label: "კატალოგი" },
  { to: "/about", label: "დახმარება" },
  { to: "/contact", label: "კონტაქტი" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="myauto24.ge">
      <div className="flex items-center rounded-xl border-2 border-primary px-2.5 py-1.5">
        <span className="text-lg font-extrabold tracking-tight text-foreground">myauto24</span>
        <span className="text-lg font-extrabold tracking-tight text-primary">.ge</span>
      </div>
    </Link>
  );
}

export function Header() {

  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Top row */}
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">
          <Logo />

          {/* Desktop center search */}
          <div className="ml-4 hidden flex-1 md:block">
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ID, ტელეფონი, საძიებო სიტყვა..."
                className="h-11 rounded-full border-muted bg-muted/40 pl-10 text-sm focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="ძებნა"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Right actions */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button asChild className="h-10 gap-1.5 rounded-full px-4 font-semibold shadow-sm">
              <Link to="/add">
                <Plus className="h-4 w-4" />
                დამატება
              </Link>
            </Button>
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted lg:inline-flex"
            >
              <Globe className="h-3.5 w-3.5" /> ქართული, ₾
            </button>
            {user ? (
              <Button asChild variant="outline" className="h-10 gap-1.5 rounded-full px-4">
                <Link to="/profile"><User className="h-4 w-4" /> პროფილი</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-10 gap-1.5 rounded-full px-4">
                <Link to="/auth"><User className="h-4 w-4" /> შესვლა</Link>
              </Button>
            )}

          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="მენიუ">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2">
                {secondaryNav.map((l, i) => (
                  <Link
                    key={i}
                    to={l.to}
                    className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-2 border-t" />
                <Link
                  to="/add"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Plus className="h-4 w-4" /> განცხადების დამატება
                </Link>
                {user ? (
                  <Link to="/profile" className="mt-2 flex items-center justify-center gap-2 rounded-full border px-3 py-3 text-sm font-semibold">
                    <User className="h-4 w-4" /> ჩემი პროფილი
                  </Link>
                ) : (
                  <Link to="/auth" className="mt-2 flex items-center justify-center gap-2 rounded-full border px-3 py-3 text-sm font-semibold">
                    <LogIn className="h-4 w-4" /> შესვლა / რეგისტრაცია
                  </Link>
                )}

              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile inline search */}
        {searchOpen && (
          <div className="border-t bg-muted/30 p-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="ID, ტელეფონი, საძიებო სიტყვა..."
                className="h-11 rounded-full bg-background pl-9"
              />
            </div>
          </div>
        )}

        {/* Secondary nav (desktop) */}
        <nav className="hidden border-t lg:block">
          <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-4 py-2.5">
            {secondaryNav.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <MobileBottomNav />
    </>
  );
}

function MobileBottomNav() {
  const { user } = useAuth();
  const items: { to: "/" | "/listings" | "/add" | "/profile" | "/auth"; label: string; icon: typeof Home; primary?: boolean }[] = [
    { to: "/", label: "მთავარი", icon: Home },
    { to: "/listings", label: "ძებნა", icon: Search },
    { to: "/add", label: "დამატება", icon: Plus, primary: true },
    { to: "/listings", label: "რჩეული", icon: Heart },
    { to: user ? "/profile" : "/auth", label: "პროფილი", icon: User },
  ];


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it, i) => (
          <li key={i}>
            <Link
              to={it.to}
              activeOptions={{ exact: it.to === "/" }}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] text-muted-foreground transition-colors [&.active]:text-primary"
            >
              {it.primary ? (
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                  <it.icon className="h-5 w-5" />
                </span>
              ) : (
                <it.icon className="h-5 w-5" />
              )}
              <span className={it.primary ? "mt-0.5" : ""}>{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
