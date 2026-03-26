import { Link } from "wouter";

export function Footer() {
    return (
        <footer className="bg-foreground text-background py-12 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <Link href="/">
                        <div className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-8 h-8 bg-primary rounded-tr-xl rounded-bl-xl flex items-center justify-center transition-transform group-hover:scale-105">
                                <span className="text-primary-foreground font-serif font-bold text-lg">I</span>
                            </div>
                            <span className="text-2xl font-serif font-bold tracking-tight uppercase">
                                India<span className="text-primary">Zameen</span>
                            </span>
                        </div>
                    </Link>
                    <p className="text-sm text-gray-400 mt-2">Professional Property Management for NRIs</p>
                </div>
                <div className="flex gap-8 text-sm text-gray-400">
                    <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                    <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </div>
                <p className="text-sm text-gray-500">© 2026 IndiaZameen. All rights reserved.</p>
            </div>
        </footer>
    );
}
