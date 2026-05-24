import { useState } from "react";
import { Search, Menu, User, LogOut } from "lucide-react";
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
import AnnouncementBar from "@/components/AnnouncementBar";
import CategoryChips from "@/components/CategoryChips";

const categories = [
  "Phones", "Laptops", "Apple", "Consoles & Games",
  "Headphones", "Accessories", "Controllers & Cables",
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-6 h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.png" alt="Gadget360.ng" className="h-7 w-7 rounded-md" />
              <span className="font-display font-bold text-base md:text-lg tracking-tight">Gadget360<span className="text-primary">.ng</span></span>
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search for phones, laptops, consoles…"
                  className="pl-10 pr-4 h-10 rounded-full bg-muted border-transparent focus:bg-background focus:border-border text-sm"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1.5 md:gap-2">
              <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer" className="hidden md:block">
                <Button className="h-9 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-glow-crimson">
                  WhatsApp Order
                </Button>
              </a>

              <CartButton />
              <div className="hidden md:block"><ThemeToggle /></div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
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
                <Button variant="outline" onClick={() => navigate("/auth")} className="hidden md:inline-flex h-9 rounded-full text-xs">
                  Sign In
                </Button>
              )}

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden rounded-full h-9 w-9">
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-display text-lg font-bold">Menu</h2>
                      <ThemeToggle />
                    </div>
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-medium">Home</Link>
                    <Link to="/shop" onClick={() => setIsOpen(false)} className="text-sm font-medium">Shop</Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)} className="text-sm font-medium">Contact</Link>
                    {!user && (
                      <Link to="/auth" onClick={() => setIsOpen(false)} className="text-sm font-medium">Sign In</Link>
                    )}
                    <hr className="border-border" />
                    <div className="space-y-1">
                      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Categories</h3>
                      {categories.map((c) => (
                        <Link
                          key={c}
                          to={`/shop?category=${encodeURIComponent(c)}`}
                          onClick={() => setIsOpen(false)}
                          className="block py-1.5 text-sm hover:text-primary transition-colors"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                    <a
                      href="https://wa.me/2347067894474"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4"
                    >
                      <Button className="w-full h-11 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white">
                        WhatsApp to Order
                      </Button>
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop category nav */}
          <nav className="hidden md:flex items-center gap-1 py-2 border-t border-border/60 overflow-x-auto scrollbar-hide">
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
              className="ml-auto shrink-0 px-3 h-8 inline-flex items-center rounded-full text-[12px] font-medium text-foreground"
            >
              All Products →
            </Link>
          </nav>
        </div>
      </header>

      <CategoryChips />
    </>
  );
};

export default Header;
