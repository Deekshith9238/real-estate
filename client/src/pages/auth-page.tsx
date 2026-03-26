import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, UserCircle, ShieldCheck, Lock } from "lucide-react";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "client"]),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    firstName: z.string().optional().or(z.literal("")),
    lastName: z.string().optional().or(z.literal("")),
});

export default function AuthPage() {
    const { user, login, register, isLoggingIn, isRegistering } = useAuth();
    const [location, setLocation] = useLocation();

    // Check for tab query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            password: "",
            role: "client",
            email: "",
            firstName: "",
            lastName: "",
        },
    });

    const onLogin = async (data: z.infer<typeof loginSchema>) => {
        try {
            await login(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRegister = async (data: z.infer<typeof registerSchema>) => {
        try {
            await register(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[450px] z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-tr-xl rounded-bl-xl flex items-center justify-center">
                            <span className="text-primary-foreground font-serif font-bold text-xl">I</span>
                        </div>
                        <span className="text-2xl font-serif font-bold tracking-tight uppercase">
                            India<span className="text-primary">Zameen</span>
                        </span>
                    </div>
                    <p className="text-muted-foreground font-medium">Professional Property Management for NRIs</p>
                </div>

                <Card className="border-border/50 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-background/80">
                    <CardHeader className="p-0">
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className="w-full grid grid-cols-2 rounded-none h-14 bg-secondary/20">
                                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-none font-semibold">Login</TabsTrigger>
                                <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-none font-semibold">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="p-6">
                                <CardTitle className="text-2xl font-serif mb-2">Welcome Back</CardTitle>
                                <CardDescription className="mb-6">Enter your credentials to access your dashboard.</CardDescription>

                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter username" {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full rounded-xl h-11 font-semibold" disabled={isLoggingIn}>
                                            {isLoggingIn ? "Logging in..." : "Login"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register" className="p-6">
                                <CardTitle className="text-2xl font-serif mb-2">Create Account</CardTitle>
                                <CardDescription className="mb-6">Join IndiaZameen to manage your property effortlessly.</CardDescription>

                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                        <FormField
                                            control={registerForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Choose a username" {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Min 6 characters" {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full rounded-xl h-11 font-semibold" disabled={isRegistering}>
                                            {isRegistering ? "Creating account..." : "Register"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>
                    </CardHeader>
                </Card>
            </motion.div>
        </div>
    );
}
