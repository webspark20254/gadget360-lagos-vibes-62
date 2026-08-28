import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";

interface ProductAddToCartProps {
  productId: string;
  stockQuantity: number;
  className?: string;
}

const ProductAddToCart = ({ productId, stockQuantity, className = "" }: ProductAddToCartProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (authLoading) {
      toast({
        title: "Checking your account",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (quantity > stockQuantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${stockQuantity} items available`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > stockQuantity) {
          toast({
            title: "Cannot add more",
            description: `Maximum ${stockQuantity} items allowed. You already have ${existingItem.quantity} in your cart.`,
            variant: "destructive"
          });
          return;
        }

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to cart",
        description: `${quantity} item(s) added to your cart`
      });

      setQuantity(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center border rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          aria-label="Decrease quantity"
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          aria-label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
          className="h-8 w-16 text-center border-0 focus-visible:ring-0"
          min="1"
          max={stockQuantity}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
          aria-label="Increase quantity"
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        onClick={handleAddToCart}
        disabled={loading || authLoading || stockQuantity === 0}
        className="flex-1"
      >
        {authLoading ? (
          "Checking..."
        ) : loading ? (
          "Adding..."
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
};

export default ProductAddToCart;