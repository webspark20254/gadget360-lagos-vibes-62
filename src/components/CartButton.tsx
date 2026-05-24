import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CartButton = () => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const loadCartCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart count:', error);
        return;
      }

      const items = (data as { quantity: number }[] | null) ?? [];
      const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/cart");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full h-9 w-9"
      onClick={handleCartClick}
    >
      <ShoppingCart className="h-4 w-4" />
      {cartCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0"
        >
          {cartCount > 99 ? "99+" : cartCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;