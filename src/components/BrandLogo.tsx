import { Link } from "react-router-dom";
import logo from "@/assets/gadget360-logo.png";

interface Props {
  size?: number;
  variant?: "light" | "dark";
  withLink?: boolean;
}

/**
 * Logo on a contrasting plate so it stays visible on any background.
 * Light variant: white plate (used on warm/ivory bg).
 * Dark variant: cream plate (used on dark/ink bg).
 */
const BrandLogo = ({ size = 44, variant = "light", withLink = true }: Props) => {
  const plate = variant === "light" ? "bg-white" : "bg-cream";
  const content = (
    <span
      className={`grid place-items-center rounded-2xl ${plate} shadow-soft ring-1 ring-black/5 shrink-0 overflow-hidden`}
      style={{ width: size, height: size }}
      aria-label="Gadget360.ng"
    >
      <img src={logo} alt="Gadget360.ng" className="w-[78%] h-[78%] object-contain" />
    </span>
  );
  if (!withLink) return content;
  return (
    <Link to="/" aria-label="Gadget360.ng home" className="shrink-0">
      {content}
    </Link>
  );
};

export default BrandLogo;
