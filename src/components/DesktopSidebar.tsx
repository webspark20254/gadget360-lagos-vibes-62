import { Home, Store, LayoutGrid, Headphones, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Store, label: "Shop", to: "/shop" },
  { icon: LayoutGrid, label: "Categories", to: "/shop" },
  { icon: Headphones, label: "Support", to: "/contact" },
  { icon: User, label: "Account", to: "/profile" },
];

const DesktopSidebar = () => (
  <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1 p-2 rounded-2xl glass-strong">
    {items.map((it) => (
      <NavLink
        key={it.label}
        to={it.to}
        end={it.to === "/"}
        title={it.label}
        className={({ isActive }) =>
          `relative h-11 w-11 grid place-items-center rounded-xl transition-all ${
            isActive
              ? "bg-foreground text-background shadow-soft"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`
        }
      >
        <it.icon size={18} strokeWidth={1.75} />
      </NavLink>
    ))}
  </aside>
);

export default DesktopSidebar;
