import { Home, Store, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Store, label: "Shop", path: "/shop" },
  { icon: Heart, label: "Favourites", path: "/profile" },
  { icon: User, label: "Profile", path: "/profile" },
];

const MobileNavigation = () => {
  const location = useLocation();

  return (
    <div
      className="fixed bottom-3 left-3 right-3 md:hidden z-50 glass-strong rounded-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-all ${
                isActive ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
