import { motion } from "framer-motion";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <NavBar />

            <main className="flex-1">
                <section className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4">Contact Us</h1>
                            <p className="text-muted-foreground">Have questions about our services? Reach out to us anytime.</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid gap-6">
                                    {[
                                        { icon: Mail, title: "Email Us", info: "support@indiazameen.com", desc: "We'll respond within 24 hours." },
                                        { icon: Phone, title: "Call Us", info: "+91 98765 43210", desc: "Mon-Fri from 9am to 6pm IST." },
                                        { icon: MapPin, title: "Office", info: "Tech Hub, MG Road, Bengaluru", desc: "Karnataka, India 560001" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-serif font-bold text-lg">{item.title}</h3>
                                                <p className="font-medium text-primary mt-1">{item.info}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl"
                            >
                                <h2 className="text-2xl font-serif font-bold mb-6">Send us a Message</h2>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Name</label>
                                            <Input placeholder="Your Name" className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <Input type="email" placeholder="your@email.com" className="rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input placeholder="How can we help?" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <Textarea placeholder="Tell us more about your property..." className="min-h-[150px] rounded-xl" />
                                    </div>
                                    <Button className="w-full rounded-xl h-12 font-semibold shadow-lg shadow-primary/20">
                                        <Send className="w-4 h-4 mr-2" /> Send Message
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
