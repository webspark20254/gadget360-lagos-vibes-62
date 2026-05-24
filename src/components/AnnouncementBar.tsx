import { MapPin, Clock, Phone } from "lucide-react";

const AnnouncementBar = () => (
  <div className="hidden md:block bg-foreground text-background text-[11px] tracking-wide">
    <div className="container mx-auto px-6 py-2 flex items-center justify-between">
      <div className="flex items-center gap-6 opacity-80">
        <span className="flex items-center gap-1.5"><MapPin size={12} /> 24 Adegbola Street, Ikeja, Lagos</span>
        <span className="flex items-center gap-1.5"><Clock size={12} /> Mon–Sat 9AM–7PM</span>
      </div>
      <a href="tel:+2347067894474" className="flex items-center gap-1.5 hover:text-primary-glow transition-colors">
        <Phone size={12} /> +234 706 789 4474
      </a>
    </div>
  </div>
);

export default AnnouncementBar;
