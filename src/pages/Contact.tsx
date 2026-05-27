import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    preferredContact: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We will reply within 24 hours. For faster response, WhatsApp +2348108418727.",
        duration: 5000,
      });
      
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
        preferredContact: ""
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact Gadget360.ng — Lagos Stores, WhatsApp & Phone"
        description="Visit Gadget360.ng in Ikeja and Computer Village, Lagos. Call +234 810 841 8727 or WhatsApp for instant help with phones, laptops, consoles and accessories."
        canonical="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Gadget360.ng",
          image: "https://gadget360.ng/favicon.png",
          telephone: "+2348108418727",
          email: "gadget360ng@gmail.com",
          url: "https://gadget360.ng/contact",
          priceRange: "₦₦",
          address: [
            { "@type": "PostalAddress", streetAddress: "24 Adegbola Street, Opposite Railway Line", addressLocality: "Ikeja", addressRegion: "Lagos", addressCountry: "NG" },
            { "@type": "PostalAddress", streetAddress: "8 Oshitelu Street, Opposite GT Bank, Computer Village", addressLocality: "Ikeja", addressRegion: "Lagos", addressCountry: "NG" },
          ],
          openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "09:00", closes: "19:00" }],
        }}
      />
      <Header />

      
      {/* Hero Section */}
      <section className="relative h-[500px] mb-16 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
        <img 
          src="/lovable-uploads/80264eaa-7e4a-4fe9-a38a-7862d5d2f2c6.png" 
          alt="Gadget360.ng Contact Hero" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-foreground max-w-4xl px-4">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent">Contact Us</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Visit our premium stores in Lagos or connect with us digitally. Experience excellence in tech retail.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Store Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-primary" size={24} />
                  Our Store Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Main Store - Adegbola</h3>
                  <p className="text-muted-foreground">
                    No 24, Adegbola Street<br />
                    Opposite Railway Line<br />
                    Ikeja, Lagos State
                  </p>
                  <div className="mt-2">
                    <a 
                      href="https://wa.me/2348108418727" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-whatsapp hover:underline"
                    >
                      WhatsApp: +234 810 841 8727
                    </a>
                  </div>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <h3 className="font-semibold text-lg">Computer Village Branch</h3>
                  <p className="text-muted-foreground">
                    No 8, Oshitelu Street<br />
                    Opposite GT Bank<br />
                    Computer Village, Ikeja, Lagos
                  </p>
                  <div className="mt-2">
                    <a 
                      href="tel:+2347067894474" 
                      className="text-primary hover:underline"
                    >
                      Phone: +234 706 789 4474
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="text-whatsapp" size={20} />
                  <div>
                    <p className="font-medium">WhatsApp (Primary)</p>
                    <a 
                      href="https://wa.me/2348108418727" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-whatsapp hover:underline"
                    >
                      +234 810 841 8727
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-primary" size={20} />
                  <div>
                    <p className="font-medium">Phone Lines</p>
                    <div className="space-y-1">
                      <a href="tel:+2348108418727" className="block text-primary hover:underline">
                        +234 810 841 8727
                      </a>
                      <a href="tel:+2347067894474" className="block text-primary hover:underline">
                        +234 706 789 4474
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-primary" size={20} />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:gadget360ng@gmail.com" 
                      className="text-primary hover:underline"
                    >
                      gadget360ng@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-primary" size={20} />
                  <div>
                    <p className="font-medium">Store Hours</p>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 9:00 AM - 7:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick WhatsApp */}
            <Card className="bg-whatsapp text-whatsapp-foreground">
              <CardContent className="p-6 text-center">
                <MessageCircle className="mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">Need Quick Help?</h3>
                <p className="mb-4 opacity-90">
                  Chat with us on WhatsApp for instant responses about products, prices, and availability.
                </p>
                <a 
                  href="https://wa.me/2348108418727" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-white text-whatsapp hover:bg-white/90">
                    <MessageCircle className="mr-2" size={20} />
                    Start WhatsApp Chat
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+234 xxx xxxx xxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredContact" className="block text-sm font-medium mb-2">
                      Preferred Contact Method
                    </label>
                    <Select value={formData.preferredContact} onValueChange={(value) => 
                      setFormData({...formData, preferredContact: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="How would you like us to respond?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Tell us about the gadgets you're looking for, any questions you have, or how we can help you..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    * Required fields. We typically respond within 24 hours.
                    <br />
                    For faster response, <a href="https://wa.me/2348108418727" target="_blank" rel="noopener noreferrer" className="text-whatsapp hover:underline">WhatsApp us directly</a>.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Store Photos */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Visit Our Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src="/lovable-uploads/578a900c-f54f-4321-8b33-489982e1be95.png" 
                    alt="Gadget360.ng Store Interior" 
                    className="rounded-lg aspect-video object-cover"
                  />
                  <img 
                    src="/lovable-uploads/c99bd10d-f2ba-4c6f-adaf-538d39fb3233.png" 
                    alt="Product Display" 
                    className="rounded-lg aspect-video object-cover"
                  />
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Directions to Computer Village Store:</h4>
                  <p className="text-sm text-muted-foreground">
                    Located in the heart of Ikeja Computer Village, our store is directly opposite GT Bank on Oshitelu Street. 
                    Look for the red Gadget360.ng signage. Free parking available on weekdays.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Find Us on the Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 text-primary" size={48} />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-muted-foreground">
                    24, Adegbola Street, Ikeja, Lagos
                  </p>
                  <a 
                    href="https://maps.google.com/?q=24+Adegbola+Street+Ikeja+Lagos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="mt-4">
                      View on Google Maps
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <LiveChat />
    </div>
  );
};

export default Contact;