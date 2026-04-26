import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ArrowRight, CheckCircle2, Star, Building2, Users, TrendingUp, FileSearch, ShieldAlert, FilePlus2, FileCheck, Compass, FileText, Files, ClipboardList, Layout, History, Landmark, Map as MapIcon, Zap, Droplets, MapPin, RefreshCcw, Stamp, FileSpreadsheet, Crop, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/booking-modal";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleServiceClick = (title: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a consultation with our experts.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => setLocation("/auth")}>
            Login
          </Button>
        ),
      });
      return;
    }
    setSelectedService(title);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <NavBar />

      <BookingModal 
        open={bookingOpen} 
        onOpenChange={setBookingOpen} 
        serviceTitle={selectedService} 
      />

      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/50 border border-primary/10 text-primary-foreground/80">
                <Star className="w-4 h-4 text-primary mr-2 fill-primary" />
                <span className="text-sm font-medium text-primary">NRI Property Management Experts</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-foreground uppercase">
                One Stop Soultion <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  For All Your
                </span>
                <br /> Property Related Matters.
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                E-Khata, BBMP, BDA, BWSSB, BESCOM, BMRDA, PODI, RTC, EC, Akarband, Village Map, Survey Sketch, Mutation Record, Khata Transfer, Tax Payment, Property Registartion.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                      Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2 hover:bg-secondary/50">
                  Learn More
                </Button>
              </div>
            </motion.div>

            {/* Right Column: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[32px] transform translate-x-4 translate-y-4 -z-10" />
              {/* Modern apartment interior */}
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
                alt="Professional Property Management"
                className="w-full h-[600px] object-cover rounded-[32px] shadow-2xl border border-white/20"
              />

              {/* Floating Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-8 -left-8 bg-card p-6 rounded-2xl shadow-xl border border-border/50 max-w-xs hidden md:block"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">1000+</p>
                    <p className="text-xs text-muted-foreground">Happy NRI Clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">100%</p>
                    <p className="text-xs text-muted-foreground">Transparency Guaranteed</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

       <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 uppercase">Property Document Services</h2>
            <p className="text-muted-foreground">Essential documents required for property transactions in South India. We assist in procuring and verifying these crucial records.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Sale Deed", sub: "Certified Copy" },
              { icon: Files, title: "EC", sub: "Encumbrance Certificate" },
              { icon: ClipboardList, title: "Khata", sub: "Extract & Certificate" },
              { icon: RefreshCcw, title: "Khata Transfer", sub: "Ownership Change" },
              { icon: MapIcon, title: "RTC / Pahani", sub: "Record of Rights" },
              { icon: FileSpreadsheet, title: "Akarband", sub: "Land Area Details" },
              { icon: Crop, title: "PODI", sub: "Land Subdivision" },
              { icon: Compass, title: "Survey Sketch", sub: "Official Layout" },
              { icon: Layout, title: "Village Map", sub: "Boundary Details" },
              { icon: History, title: "Mutation Record", sub: "Ownership History" },
              { icon: Landmark, title: "GBA Records", sub: "e-Khata & Tax" },
              { icon: Building2, title: "BDA", sub: "Layout Approvals" },
              { icon: MapPin, title: "BMRDA", sub: "Region Approvals" },
              { icon: Zap, title: "BESCOM", sub: "Electricity Connections" },
              { icon: Droplets, title: "BWSSB", sub: "Water Connections" },
              { icon: Stamp, title: "Property Registration", sub: "Sub-Registrar Office" },
              { icon: Briefcase, title: "Dept. Liaison", sub: "Govt & Revenue Depts" }
            ].map((doc, i) => (
              <div 
                key={i} 
                onClick={() => handleServiceClick(doc.title)}
                className="bg-background p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <doc.icon className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-sm tracking-tight">{doc.title}</h4>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">{doc.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 uppercase">Other Core Services</h2>
            <p className="text-muted-foreground">Comprehensive solutions tailored for Non-Resident Indians to manage their assets with peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Tenancy Management",
                desc: "Tenant search, rigorous background checks, rental agreement handling, and monthly rent collection."
              },
              {
                icon: Building2,
                title: "Property Maintenance",
                desc: "Regular inspections, cleaning, home improvements, and specialized repairs (plumbing, electrical)."
              },
              {
                icon: CheckCircle2,
                title: "Compliance & Bills",
                desc: "Property tax payments, utility bill management, and assistance with legal documentation."
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                onClick={() => handleServiceClick(feature.title)}
                className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Advisory Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 uppercase">Real Estate Expert Advisory</h2>
            <p className="text-muted-foreground">Get property insights and professional guidance from seasoned real-estate experts to handle complex property matters.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileSearch,
                title: "Property Analysis",
                desc: "Complete property analysis including market trends, location valuation, legal document review, and future appreciation insights."
              },
              {
                icon: ShieldAlert,
                title: "Property Disputes",
                desc: "Expert guidance and resolution strategies for property-related disputes and legal complexities."
              },
              {
                icon: FilePlus2,
                title: "Missing Documents Procurement",
                desc: "Professional assistance in identifying, locating, and retrieving missing or lost property documents through official channels."
              },
              {
                icon: FileCheck,
                title: "Document Rectification",
                desc: "Specialized help in correcting errors in title deeds, sale agreements, and other legal property documentation."
              },
              {
                icon: Compass,
                title: "Survey Issue Rectification",
                desc: "Support for land survey matters, boundary disputes, and official measurement rectifications."
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                onClick={() => handleServiceClick(feature.title)}
                className="bg-secondary/10 p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Documents Section */}



      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 uppercase">How It Works</h2>
            <p className="text-muted-foreground">Four simple steps to get your property professionally managed.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Inquiry",
                desc: "Send us your property details and management needs."
              },
              {
                step: "02",
                title: "Property Visit",
                desc: "Our experts visit and assess the property's condition."
              },
              {
                step: "03",
                title: "Agreement",
                desc: "Transparent contracts with fixed and fair pricing."
              },
              {
                step: "04",
                title: "Management",
                desc: "Sit back and relax while we handle everything end-to-end."
              }
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-2xl border border-border/50 bg-secondary/10 flex flex-col items-center text-center">
                <span className="text-4xl font-serif font-bold text-primary/20 mb-4">{step.step}</span>
                <h3 className="text-xl font-serif font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
