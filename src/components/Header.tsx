import { useState } from "react";
import { Search, Menu, User, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/gadget360-logo.png";

const categories = [
  "Phones", "Laptops", "Apple", "Consoles & Games",
  "Headphones", "Accessories", "Controllers & Cables",
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto px-5 md:px-8">
        <div className="flex items-center gap-4 md:gap-8 h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="Gadget360.ng" className="h-10 w-10 md:h-11 md:w-11 object-contain" />
            <div className="hidden sm:block leading-none">
              <div className="font-display font-bold text-lg md:text-xl tracking-tight">Gadget360</div>
              <div className="font-serif-display text-[11px] text-primary -mt-0.5">.ng</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <Link to="/" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Shop</Link>
            <Link to="/shop" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            <Link to="/contact" className="px-3 h-9 inline-flex items-center text-sm font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                placeholder="Search phones, laptops, consoles…"
                className="pl-10 pr-4 h-10 rounded-full bg-muted/60 border-transparent focus:bg-background focus:border-border text-sm"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1.5">
            <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <Button className="h-10 px-4 rounded-full bg-primary hover:bg-primary-glow text-primary-foreground text-xs font-semibold shadow-glow-crimson">
                Order on WhatsApp
              </Button>
            </a>

            <CartButton />
            <div className="hidden md:block"><ThemeToggle /></div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
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
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <div className="flex flex-col gap-1 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img src={logo} alt="" className="h-8 w-8" />
                      <span className="font-display font-bold text-lg">Gadget360<span className="text-primary">.ng</span></span>
                    </div>
                    <ThemeToggle />
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
                    {categories.map((c) => (
                      <Link
                        key={c}
                        to={`/shop?category=${encodeURIComponent(c)}`}
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-2.5 rounded-xl bg-muted text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                  <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer" className="mt-6">
                    <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
                      Order on WhatsApp
                    </Button>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop category strip */}
        <nav className="hidden md:flex items-center gap-1 py-2 border-t border-border/40 overflow-x-auto scrollbar-hide">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/shop?category=${encodeURIComponent(c)}`}
              className="shrink-0 px-3 h-8 inline-flex items-center rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {c}
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
