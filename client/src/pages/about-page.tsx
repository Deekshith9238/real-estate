import { motion } from "framer-motion";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Target, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <NavBar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-secondary/30 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl"
                        >
                            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6">About IndiaZameen</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                We are dedicated to providing seamless property management solutions for Non-Resident Indians (NRIs),
                                ensuring their assets in India are well-maintained, compliant, and profitable.
                            </p>
                        </motion.div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                </section>

                {/* Vision & Mission */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-serif font-bold mb-8 uppercase tracking-wider text-primary">Our Journey</h2>
                                <div className="space-y-6 text-muted-foreground leading-relaxed">
                                    <p>
                                        IndiaZameen was founded on the principle of trust and transparency. We understood the challenges
                                        NRIs face when managing properties from thousands of miles away—from unreliable tenants to
                                        complex legal documentations.
                                    </p>
                                    <p>
                                        Our mission is to bridge this gap by providing a professional, technology-driven platform
                                        that offers complete peace of mind to property owners residing abroad.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { icon: Target, title: "Our Mission", desc: "To be the most trusted partner for NRIs in managing their Indian real estate assets through professional and transparent services." },
                                    { icon: ShieldCheck, title: "Our Values", desc: "Integrity, transparency, and a commitment to excellence are at the heart of everything we do." },
                                    { icon: Heart, title: "Customer First", desc: "We treat every property as if it were our own, ensuring the highest standards of care and maintenance." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-bold text-lg mb-1">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
