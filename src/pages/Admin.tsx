import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import Seo from "@/components/Seo";
import {
  Package,
  Users,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Upload,
  X,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

import { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['products']['Row'];
type User = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];

const getErrorMessage = (error: unknown, fallback = "Something went wrong") =>
  error instanceof Error ? error.message : fallback;

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    meta_title: "",
    meta_description: "",
    is_featured: false,
    badge_text: "",
    badge_color: ""
  });
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMainImageUrl, setUploadedMainImageUrl] = useState<string>("");
  const [uploadedAdditionalUrls, setUploadedAdditionalUrls] = useState<string[]>([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  

  const navigate = useNavigate();
  const { toast } = useToast();

  // Example prompts for AI generation
  const examplePrompts = [
    "Gaming laptop with RTX 4090, 32GB RAM, RGB keyboard - ₦1,200,000",
    "iPhone 15 Pro Max 256GB Space Black with accessories - ₦850,000",
    "Sony WH-1000XM5 wireless noise cancelling headphones - ₦185,000",
    "PS5 console with 2 controllers and 3 games bundle - ₦420,000"
  ];

  // Create image preview when file is selected
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview("");
    }
  }, [imageFile]);

  // Create previews for additional images
  useEffect(() => {
    if (additionalImages.length > 0) {
      const readers = additionalImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(previews => {
        setAdditionalPreviews(previews);
      });
    } else {
      setAdditionalPreviews([]);
    }
  }, [additionalImages]);

  useEffect(() => {
    let mounted = true;
    let productsChannel: ReturnType<typeof supabase.channel> | null = null;
    let authorized = false;

    const verifyAndBoot = async (userId: string, email: string | null) => {
      if (authorized) return;
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (!mounted) return;
      if (roleError || !isAdmin) {
        setAuthChecking(false);
        setLoading(false);
        toast({ title: "Admin access only", description: "This dashboard is restricted to approved Gadget360 admins.", variant: "destructive" });
        navigate("/");
        return;
      }
      authorized = true;
      setAdminEmail(email || "admin");
      setAuthChecking(false);
      await fetchData();

      productsChannel = supabase
        .channel('products-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              toast({ title: "New Product Added", description: "A new product has been added to the store" });
            } else if (payload.eventType === 'UPDATE') {
              toast({ title: "Product Updated", description: "A product has been updated" });
            } else if (payload.eventType === 'DELETE') {
              toast({ title: "Product Deleted", description: "A product has been removed from the store" });
            }
            fetchData();
          }
        )
        .subscribe();
    };

    // Subscribe FIRST so we catch INITIAL_SESSION during hydration
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        void verifyAndBoot(session.user.id, session.user.email ?? null);
      } else if (event === "SIGNED_OUT") {
        authorized = false;
        setAuthChecking(false);
        setLoading(false);
        navigate("/auth");
      }
    });

    // Also check existing session immediately (covers hard refresh / direct URL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        void verifyAndBoot(session.user.id, session.user.email ?? null);
      } else {
        // Give the auth client a brief window to hydrate before redirecting
        setTimeout(async () => {
          if (!mounted || authorized) return;
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (!mounted || authorized) return;
          if (s2?.user) {
            void verifyAndBoot(s2.user.id, s2.user.email ?? null);
          } else {
            setAuthChecking(false);
            setLoading(false);
            toast({ title: "Sign in required", description: "Please sign in before opening the admin dashboard.", variant: "destructive" });
            navigate("/auth");
          }
        }, 400);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (productsChannel) supabase.removeChannel(productsChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, toast]);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsData) {
        setProducts(productsData);
      }

      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
      }

      // Fetch chat sessions
      const { data: chatData } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (chatData) {
        setChatSessions(chatData);
      }

      // Calculate stats
      if (productsData) setStats(prev => ({ ...prev, totalProducts: productsData.length }));
      if (usersData) setStats(prev => ({ ...prev, totalUsers: usersData.length }));
      if (ordersData) {
        setStats(prev => ({ 
          ...prev, 
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (user: User) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        
        fetchData();
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };


  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    if (files.length > 10) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 10 images at once",
        variant: "destructive",
      });
      return [];
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      // Use direct fetch — supabase.functions.invoke sometimes mishandles multipart FormData
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Upload error:', data);
        throw new Error(data?.error || `Upload failed (HTTP ${res.status})`);
      }

      if (!data?.urls || data.urls.length === 0) {
        throw new Error('No URLs returned from upload');
      }

      toast({
        title: "Success",
        description: `${data.urls.length} image(s) uploaded successfully`,
      });

      return data.urls;
    } catch (error: unknown) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Error",
        description: getErrorMessage(error, "Failed to upload images. Please try again."),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Auto-upload immediately
    const urls = await uploadImagesToStorage([file]);
    if (urls.length > 0) {
      setUploadedMainImageUrl(urls[0]);
      setNewProduct(prev => ({ ...prev, image: urls[0] }));
    }
  };

  const handleAdditionalImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 10) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 10 images at once",
        variant: "destructive",
      });
      return;
    }

    setAdditionalImages(files);
    
    // Auto-upload immediately
    const urls = await uploadImagesToStorage(files);
    if (urls.length > 0) {
      setUploadedAdditionalUrls(prev => [...prev, ...urls]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use uploaded URLs (already uploaded when files were selected)
      const imageUrl = uploadedMainImageUrl || newProduct.image;
      const additionalImageUrls = uploadedAdditionalUrls;

      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          category: newProduct.category,
          stock_quantity: Number(newProduct.stock) || 0,
          image_url: imageUrl,
          additional_images: additionalImageUrls,
          is_featured: newProduct.is_featured,
          meta_title: newProduct.meta_title || newProduct.name,
          meta_description: newProduct.meta_description || newProduct.description,
          badge_text: newProduct.badge_text,
          badge_color: newProduct.badge_color
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      resetForm();
      fetchData();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      stock: product.stock_quantity.toString(),
      image: product.image_url || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      is_featured: product.is_featured || false,
      badge_text: product.badge_text || "",
      badge_color: product.badge_color || ""
    });
  };

  const updateProduct = async () => {
    if (!editingProduct || !newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use uploaded URLs or existing ones
      const imageUrl = uploadedMainImageUrl || newProduct.image;
      const existingAdditionalUrls = editingProduct.additional_images || [];
      const additionalImageUrls = [...existingAdditionalUrls, ...uploadedAdditionalUrls];

      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          category: newProduct.category,
          stock_quantity: Number(newProduct.stock) || 0,
          image_url: imageUrl,
          additional_images: additionalImageUrls,
          is_featured: newProduct.is_featured,
          meta_title: newProduct.meta_title || newProduct.name,
          meta_description: newProduct.meta_description || newProduct.description,
          badge_text: newProduct.badge_text,
          badge_color: newProduct.badge_color
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      resetForm();
      fetchData();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
      meta_title: "",
      meta_description: "",
      is_featured: false,
      badge_text: "",
      badge_color: ""
    });
    setImageFile(null);
    setAdditionalImages([]);
    setImagePreview("");
    setAdditionalPreviews([]);
    setUploadedMainImageUrl("");
    setUploadedAdditionalUrls([]);
  };

  const deleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        
        fetchData();
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };

  const duplicateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: `${product.name} (Copy)`,
          description: product.description,
          price: product.price,
          category: product.category,
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          additional_images: product.additional_images,
          is_featured: false,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          badge_text: product.badge_text,
          badge_color: product.badge_color
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product duplicated successfully",
      });
      
      fetchData();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please select products to delete",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedProducts);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${selectedProducts.length} products deleted successfully`,
        });
        
        setSelectedProducts([]);
        fetchData();
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };

  const generateProductWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product description for AI generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Use already uploaded image URL if available
      const imageUrlToUse = uploadedMainImageUrl || undefined;

      const { data, error } = await supabase.functions.invoke('generate-product', {
        body: { 
          prompt: aiPrompt,
          imageUrl: imageUrlToUse
        }
      });

      if (error) throw error;

      if (data?.product) {
        setNewProduct({
          name: data.product.name,
          description: data.product.description,
          price: data.product.price.toString(),
          category: data.product.category,
          stock: data.product.stock.toString(),
          image: data.product.image_url || uploadedMainImageUrl || "",
          meta_title: data.product.name,
          meta_description: data.product.description,
          is_featured: false,
          badge_text: "",
          badge_color: ""
        });

        toast({
          title: "Success",
          description: "Product generated! Review and save to add to store.",
          action: (
            <Button size="sm" onClick={addProduct}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Now
            </Button>
          ),
        });
        
        setAiPrompt("");
      }
    } catch (error: unknown) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to generate product"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (authChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin Console — Gadget360.ng" description="Internal Gadget360.ng admin dashboard for managing products, orders, customers and live traffic analytics." canonical="/admin" />
      {/* Editorial header band */}
      <section className="bg-gradient-warm border-b border-border/60 grain relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-8 md:py-12">
          <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <span>Admin · Gadget360.ng</span>
            <span>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
              The <span className="font-serif-display text-primary">control</span> room.
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => navigate("/")} variant="outline" className="rounded-full h-10 border-foreground/30">
                Back to Store
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-5 md:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="rounded-2xl bg-cream text-cream-foreground p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Products</div>
              <Package size={16} className="text-muted-foreground" />
            </div>
            <div className="font-display font-bold text-3xl mt-2 tabular-nums">{stats.totalProducts}</div>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Users</div>
              <Users size={16} className="opacity-60" />
            </div>
            <div className="font-display font-bold text-3xl mt-2 tabular-nums">{stats.totalUsers}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Orders</div>
              <ShoppingCart size={16} className="text-muted-foreground" />
            </div>
            <div className="font-display font-bold text-3xl mt-2 tabular-nums">{stats.totalOrders}</div>
          </div>
          <div className="rounded-2xl bg-primary text-primary-foreground p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Revenue</div>
              <TrendingUp size={16} className="opacity-80" />
            </div>
            <div className="font-display font-bold text-2xl md:text-3xl mt-2 tabular-nums truncate">₦{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <div className="-mx-5 md:mx-0 overflow-x-auto no-scrollbar">
            <TabsList className="rounded-full bg-muted h-11 md:h-12 p-1 inline-flex w-max md:w-auto mx-5 md:mx-0">
              <TabsTrigger value="analytics" className="rounded-full px-3 md:px-4 gap-1.5 text-xs md:text-sm whitespace-nowrap"><BarChart3 size={14} /> Analytics</TabsTrigger>
              <TabsTrigger value="products" className="rounded-full px-3 md:px-4 gap-1.5 text-xs md:text-sm whitespace-nowrap"><Package size={14} /> Products</TabsTrigger>
              <TabsTrigger value="users" className="rounded-full px-3 md:px-4 gap-1.5 text-xs md:text-sm whitespace-nowrap"><Users size={14} /> Users</TabsTrigger>
              <TabsTrigger value="orders" className="rounded-full px-3 md:px-4 gap-1.5 text-xs md:text-sm whitespace-nowrap"><ShoppingCart size={14} /> Orders</TabsTrigger>
              <TabsTrigger value="chat" className="rounded-full px-3 md:px-4 gap-1.5 text-xs md:text-sm whitespace-nowrap"><MessageSquare size={14} /> Chat</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsPanel autoDownload={new URLSearchParams(window.location.search).get("download") as any} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* AI Product Generator */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Product Generator (Powered by Gemini)
                </CardTitle>
                <CardDescription>
                  Upload an image and describe your product - AI will generate all the details instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example Prompts */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Example Prompts:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-auto py-2 px-3"
                        onClick={() => setAiPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Image (Recommended)</label>
                  <div className="flex flex-col gap-4">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {isUploading ? 'Uploading...' : 'Upload Image (Auto-Upload)'}
                        </span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    
                    {/* Display uploaded URL */}
                    {uploadedMainImageUrl && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Uploaded Image URL:</label>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                          <Input
                            value={uploadedMainImageUrl}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(uploadedMainImageUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {imageFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            setUploadedMainImageUrl("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* AI Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Describe Your Product</label>
                  <Textarea
                    placeholder="E.g., 'Create a premium gaming laptop with RGB keyboard, 32GB RAM, RTX 4090, priced around ₦1,200,000'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateProductWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Product with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Add/Edit Product Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingProduct ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
                <CardDescription>
                  {editingProduct ? 'Update product information' : 'Add new products to your store'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Product Name *"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Price (₦) *"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apple">Apple</SelectItem>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Laptops">Laptops</SelectItem>
                        <SelectItem value="Smartphones">Smartphones</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Stock Quantity *"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    />
                  </div>
                  <Textarea
                    placeholder="Product Description *"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={4}
                  />
                </div>

                 {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Product Images</h3>
                  
                  {/* Main Image */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Main Image</label>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {isUploading ? 'Uploading...' : 'Upload Main Image (Auto-Upload)'}
                          </span>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageSelect}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <Input
                        placeholder="Or enter image URL manually"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      />
                      
                      {/* URL Display Box */}
                      {uploadedMainImageUrl && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                          <Input
                            value={uploadedMainImageUrl}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(uploadedMainImageUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {(imagePreview || newProduct.image) && (
                        <div className="relative w-32 h-32">
                          <img 
                            src={imagePreview || newProduct.image} 
                            alt="Main preview" 
                            className="w-full h-full object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview("");
                              setNewProduct({...newProduct, image: ""});
                              setUploadedMainImageUrl("");
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Images (Max 10 total)</label>
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors w-fit">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">
                          {isUploading ? 'Uploading...' : 'Add More Images (Auto-Upload)'}
                        </span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    
                    {/* Uploaded URLs Display */}
                    {uploadedAdditionalUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Uploaded Image URLs:</p>
                        {uploadedAdditionalUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                            <Input
                              value={url}
                              readOnly
                              className="text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setUploadedAdditionalUrls(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {additionalPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {additionalPreviews.map((preview, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img 
                              src={preview} 
                              alt={`Additional ${index + 1}`} 
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                              onClick={() => {
                                setAdditionalImages(prev => prev.filter((_, i) => i !== index));
                                setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Advanced Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={newProduct.is_featured}
                        onCheckedChange={(checked) => 
                          setNewProduct({...newProduct, is_featured: checked as boolean})
                        }
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Featured Product
                      </label>
                    </div>
                    <Input
                      placeholder="Badge Text (e.g., 'NEW', 'SALE')"
                      value={newProduct.badge_text}
                      onChange={(e) => setNewProduct({...newProduct, badge_text: e.target.value})}
                    />
                    <Select 
                      value={newProduct.badge_color} 
                      onValueChange={(value) => setNewProduct({...newProduct, badge_color: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Badge Color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">SEO Optimization</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Meta Title (for search engines)"
                      value={newProduct.meta_title}
                      onChange={(e) => setNewProduct({...newProduct, meta_title: e.target.value})}
                    />
                    <Textarea
                      placeholder="Meta Description (for search engines)"
                      value={newProduct.meta_description}
                      onChange={(e) => setNewProduct({...newProduct, meta_description: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={editingProduct ? updateProduct : addProduct} 
                    className="flex-1"
                    size="lg"
                  >
                    {editingProduct ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Product
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </Button>
                  {editingProduct && (
                    <Button onClick={resetForm} variant="outline" size="lg">
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (newProduct.name) {
                        setPreviewProduct({
                          id: 'preview',
                          name: newProduct.name,
                          description: newProduct.description,
                          price: Number(newProduct.price),
                          category: newProduct.category,
                          stock_quantity: Number(newProduct.stock),
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          image_url: imagePreview || newProduct.image,
                          additional_images: additionalPreviews,
                          is_featured: newProduct.is_featured,
                          meta_title: newProduct.meta_title || newProduct.name,
                          meta_description: newProduct.meta_description || newProduct.description,
                          badge_text: newProduct.badge_text || null,
                          badge_color: newProduct.badge_color || null,
                        });
                        setShowPreview(true);
                      }
                    }}
                    variant="secondary"
                    size="lg"
                    disabled={!newProduct.name}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <span>{selectedProducts.length} products selected</span>
                  <Button onClick={bulkDelete} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts(products.map(p => p.id));
                            } else {
                              setSelectedProducts([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts(prev => [...prev, product.id]);
                              } else {
                                setSelectedProducts(prev => prev.filter(id => id !== product.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">₦{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                            {product.stock_quantity} in stock
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.is_featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setPreviewProduct(product);
                                setShowPreview(true);
                              }}
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startEditing(product)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => duplicateProduct(product)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteProduct(product.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users ({users.length})</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'N/A'}</TableCell>
                        <TableCell className="font-mono text-xs">{user.user_id.slice(0, 12)}...</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders ({orders.length})</CardTitle>
                <CardDescription>Manage customer orders</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.customer_email}</TableCell>
                        <TableCell className="font-semibold">₦{Number(order.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat Sessions ({chatSessions.length})</CardTitle>
                <CardDescription>Monitor customer conversations</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-xs">{session.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-mono text-xs">{session.user_id ? session.user_id.slice(0, 8) : "Guest"}</TableCell>
                        <TableCell>
                          <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Active' : 'Closed'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(session.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
            <DialogDescription>
              This is how the product will appear on your store
            </DialogDescription>
          </DialogHeader>
          {previewProduct && (
            <div className="space-y-4">
              {previewProduct.image_url && (
                <img 
                  src={previewProduct.image_url} 
                  alt={previewProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{previewProduct.name}</h2>
                  {previewProduct.badge_text && (
                    <Badge style={{ backgroundColor: previewProduct.badge_color || 'blue' }}>
                      {previewProduct.badge_text}
                    </Badge>
                  )}
                  {previewProduct.is_featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold text-primary">
                  ₦{previewProduct.price.toLocaleString()}
                </p>
                <Badge variant="outline">{previewProduct.category}</Badge>
                <p className="text-muted-foreground">{previewProduct.description}</p>
                <p className="text-sm">
                  <span className="font-medium">Stock:</span> {previewProduct.stock_quantity} available
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
