import { Link } from "react-router-dom";
import logo from "@/assets/gadget360-logo.png";

interface Props {
  size?: number;
  /** "light" = dark plate (use on ivory/light backgrounds), "dark" = light plate (use on ink) */
  variant?: "light" | "dark";
  withLink?: boolean;
}

/**
 * Logo always sits on a contrasting plate so a white-glyph logo stays visible.
 * Default (light) places it on a dark ink plate for the ivory header background.
 */
const BrandLogo = ({ size = 44, variant = "light", withLink = true }: Props) => {
  const plate =
    variant === "light"
      ? "bg-foreground ring-foreground/10"
      : "bg-background ring-background/20";

  const content = (
    <span
      className={`grid place-items-center rounded-2xl ${plate} shadow-soft ring-1 shrink-0 overflow-hidden`}
      style={{ width: size, height: size }}
      aria-label="Gadget360.ng"
    >
      <img src={logo} alt="Gadget360.ng" className="w-[82%] h-[82%] object-contain" />
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
