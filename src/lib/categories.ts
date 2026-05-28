// Canonical product categories — MUST match values stored in the products table
// in Supabase: Smartphones, Laptops, Apple, Gaming, Audio, Accessories.
import { Smartphone, Laptop, Apple, Gamepad2, Headphones, Cable } from "lucide-react";

export interface CategoryDef {
  name: string;
  slug: string;
  icon: typeof Smartphone;
}

export const CATEGORIES: CategoryDef[] = [
  { name: "Smartphones", slug: "Smartphones", icon: Smartphone },
  { name: "Laptops", slug: "Laptops", icon: Laptop },
  { name: "Apple", slug: "Apple", icon: Apple },
  { name: "Gaming", slug: "Gaming", icon: Gamepad2 },
  { name: "Audio", slug: "Audio", icon: Headphones },
  { name: "Accessories", slug: "Accessories", icon: Cable },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
