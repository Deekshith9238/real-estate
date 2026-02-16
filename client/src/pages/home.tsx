import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { ArrowRight, CheckCircle2, Star, Building2, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <NavBar />
      
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
                <span className="text-sm font-medium text-primary">Premium Real Estate Consulting</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-foreground">
                Expert Guidance for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  Prime Properties
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Navigate the luxury real estate market with confidence. 
                Our consultants provide personalized insights to help you secure your dream investment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/api/login">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                      Get Started <ArrowRight className="ml-2 w-5 h-5" />
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
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
                alt="Luxury Interior" 
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
                    <p className="font-bold text-lg">500+</p>
                    <p className="text-xs text-muted-foreground">Properties Managed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">$2.4B</p>
                    <p className="text-xs text-muted-foreground">Total Valuation</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4">Why Choose EstateConsult?</h2>
            <p className="text-muted-foreground">We bring decades of experience and market intelligence to your real estate journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Dedicated Experts",
                desc: "Work 1-on-1 with a consultant who understands your specific goals and preferences."
              },
              {
                icon: Building2,
                title: "Exclusive Listings",
                desc: "Access off-market properties and pre-construction opportunities before anyone else."
              },
              {
                icon: CheckCircle2,
                title: "Verified Process",
                desc: "Our rigorous due diligence ensures every investment is secure and sound."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
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

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-2xl font-serif font-bold tracking-tight">
              Estate<span className="text-primary">Consult</span>
            </span>
            <p className="text-sm text-gray-400 mt-2">Premium Real Estate Consulting Services</p>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-500">© 2024 EstateConsult. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
