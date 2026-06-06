import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waOrderUrl, waQuoteUrl, formatNaira } from "@/lib/whatsapp";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  inStock?: boolean;
  isNew?: boolean;
  specs?: string;
  isFeatured?: boolean;
  badgeText?: string;
  badgeColor?: string;
}

const ProductCard = ({
  id, name, price, originalPrice, image, category,
  rating = 4.5, inStock = true, isNew = false,
  isFeatured = false, badgeText, badgeColor,
}: ProductCardProps) => {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:-translate-y-1 hover:shadow-card transition-all duration-300">
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-square bg-muted/50 overflow-hidden">
          <OptimizedImage
            src={image}
            alt={name}
            className="w-full h-full p-4 group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isFeatured && (
              <Badge className="bg-foreground text-background text-[10px] font-medium px-2 py-0.5 rounded-full border-0">Featured</Badge>
            )}
            {badgeText && (
              <Badge className="text-[10px] font-medium px-2 py-0.5 rounded-full border-0" style={{ backgroundColor: badgeColor || 'hsl(var(--primary))', color: 'white' }}>
                {badgeText}
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border-0">New</Badge>
            )}
            {originalPrice && (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border-0">
                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-2.5 right-2.5 h-8 w-8 grid place-items-center rounded-full glass text-foreground hover:text-primary transition-colors"
            aria-label="Save"
          >
            <Heart size={14} strokeWidth={1.75} />
          </button>

          {!inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/80 text-background text-[10px] font-medium text-center py-1">
              Out of stock
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 md:p-4 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{category}</div>
        <Link to={`/product/${id}`}>
          <h3 className="text-sm md:text-[15px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star size={12} className="fill-primary text-primary" />
          <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
          <span>·</span>
          <span className={inStock ? "text-success" : "text-destructive"}>
            {inStock ? "In stock" : "Sold out"}
          </span>
        </div>

        <div className="pt-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="font-display font-bold text-base md:text-lg text-foreground leading-none">
              {formatNaira(price)}
            </div>
            {originalPrice && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatNaira(originalPrice)}
              </div>
            )}
          </div>
          {/* Mobile: single Order button. Desktop (sm+): Order + Quote */}
          <div className="flex gap-1.5">
            <a
              href={waOrderUrl(name, price)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1"
              data-wa-source="product-card"
              data-wa-product={name}
              data-wa-product-id={id}
              data-wa-quantity={1}
              data-wa-total={price}
            >
              <Button
                size="sm"
                disabled={!inStock}
                className="w-full h-9 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-[11px] font-semibold gap-1.5 px-2"
              >
                <WhatsAppIcon size={12} /> Order
              </Button>
            </a>
            <a
              href={waQuoteUrl(name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:block flex-1"
              data-wa-source="product-card-quote"
              data-wa-product={name}
              data-wa-product-id={id}
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 rounded-full border-foreground/20 text-[11px] font-semibold gap-1.5 px-2"
              >
                <WhatsAppIcon size={12} /> Quote
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
