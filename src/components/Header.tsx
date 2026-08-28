import { useState } from "react";
import { Menu, User, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@/lib/router-compat";
import { LEGAL_PAGES } from "@/lib/legal";

import { useAuth } from "@/hooks/useAuth";
import MiniCart from "@/components/MiniCart";
import ThemeToggle from "@/components/ThemeToggle";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import BrandLogo from "@/components/BrandLogo";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { waGeneralUrl } from "@/lib/whatsapp";
import { CATEGORIES } from "@/lib/categories";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto px-5 md:px-8">
        <div className="flex items-center gap-4 md:gap-8 h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Gadget360.ng home">
            <BrandLogo size={42} variant="light" withLink={false} />
            <div className="hidden sm:flex items-baseline gap-0.5 leading-none">
              <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-foreground">Gadget360</span>
              <span className="font-serif-display text-base text-primary">.ng</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <Link to="/" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Shop</Link>
            <Link to="/contact" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md ml-auto">
            <SearchAutocomplete className="w-full" />
          </div>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1.5">
            <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <Button className="h-10 px-4 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-xs font-semibold shadow-soft gap-2">
                <WhatsAppIcon size={14} /> Order on WhatsApp
              </Button>
            </a>

            <MiniCart />
            <div className="hidden md:block"><ThemeToggle /></div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" aria-label="Open account menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden md:inline-flex h-10 rounded-full text-xs">
                Sign In
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10" aria-label="Open navigation menu">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <div className="flex flex-col gap-1 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BrandLogo size={36} withLink={false} />
                      <span className="font-display font-bold text-lg">Gadget360<span className="font-serif-display text-primary">.ng</span></span>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="mb-3">
                    <SearchAutocomplete placeholder="Search…" onNavigate={() => setIsOpen(false)} />
                  </div>

                  {[
                    { l: "Home", to: "/" },
                    { l: "Shop", to: "/shop" },
                    { l: "Contact", to: "/contact" },
                    { l: "Profile", to: "/profile" },
                    ...(!user ? [{ l: "Sign In", to: "/auth" }] : []),
                  ].map((i) => (
                    <Link
                      key={i.l}
                      to={i.to}
                      onClick={() => setIsOpen(false)}
                      className="py-3 text-base font-medium border-b border-border/60 hover:text-primary transition-colors"
                    >
                      {i.l}
                    </Link>
                  ))}
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-6 mb-2">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/shop?category=${encodeURIComponent(c.slug)}`}
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-2.5 rounded-xl bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-6 mb-2">Policies</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {LEGAL_PAGES.map((p) => (
                      <Link
                        key={p.to}
                        to={p.to}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>

                  <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer" className="mt-6">
                    <Button className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                      <WhatsAppIcon size={16} /> Order on WhatsApp
                    </Button>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop category strip */}
        <nav className="hidden md:flex items-center gap-1 py-2 border-t border-border/40 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/shop?category=${encodeURIComponent(c.slug)}`}
              className="shrink-0 px-3 h-8 inline-flex items-center rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/shop"
            className="ml-auto shrink-0 px-3 h-8 inline-flex items-center gap-1 rounded-full text-[12px] font-semibold text-primary"
          >
            <ShoppingBag size={12} /> All Products
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
