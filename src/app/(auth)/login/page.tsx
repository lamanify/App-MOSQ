"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Signup State
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    toast.error("E-mel atau kata laluan tidak sah");
                } else {
                    toast.error(error.message);
                }
                return;
            }

            toast.success("Berjaya log masuk!");
            router.push("/admin");
            router.refresh();
        } catch {
            toast.error("Ralat berlaku. Sila cuba lagi.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Kata laluan tidak sepadan");
            return;
        }

        if (password.length < 6) {
            toast.error("Kata laluan mestilah sekurang-kurangnya 6 aksara");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    toast.error("E-mel ini sudah didaftarkan");
                } else {
                    toast.error(error.message);
                }
                return;
            }

            if (data.user) {
                toast.success("Akaun berjaya didaftarkan!");
                router.push("/onboarding");
                router.refresh();
            }
        } catch {
            toast.error("Ralat berlaku. Sila cuba lagi.");
        } finally {
            setLoading(false);
        }
    }

    const toggleView = () => {
        setView(view === "login" ? "signup" : "login");
        // Reset sensitive fields or errors if needed, though simpler to keep state for UX unless requested otherwise
        setShowPassword(false);
    };

    const isLogin = view === "login";

    return (
        <div className="glass-card p-8 animate-slide-up w-full">
            {/* Logo & Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-8">
                    <Image
                        src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766798421/Mosq_7_vn5zgh.webp"
                        alt="MOSQ Logo"
                        width={240}
                        height={80}
                        className="h-16 w-auto object-contain"
                        priority
                    />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isLogin ? "Log Masuk" : "Daftar Akaun"}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isLogin ? "Selamat kembali ke MOSQ" : "Bina laman web masjid percuma"}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
                {!isLogin && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <Label htmlFor="name" className="form-label">
                            Nama Penuh
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Masukkan nama penuh"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="form-input"
                            autoComplete="name"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email" className="form-label">
                        E-mel
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="contoh@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="form-label">
                        Kata Laluan
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={isLogin ? "Masukkan kata laluan" : "Minimum 6 aksara"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={!isLogin ? 6 : undefined}
                            className="form-input pr-12"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 tap-target"
                            aria-label={showPassword ? "Sembunyi kata laluan" : "Tunjuk kata laluan"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {!isLogin && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <Label htmlFor="confirmPassword" className="form-label">
                            Sahkan Kata Laluan
                        </Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan semula kata laluan"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={!isLogin}
                            minLength={6}
                            className="form-input"
                            autoComplete="new-password"
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isLogin ? "Sedang log masuk..." : "Sedang mendaftar..."}
                        </>
                    ) : (
                        isLogin ? "Log Masuk" : "Daftar Sekarang"
                    )}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    {isLogin ? "Belum ada akaun? " : "Sudah ada akaun? "}
                    <button
                        type="button"
                        onClick={toggleView}
                        className="text-black hover:underline font-bold focus:outline-none"
                    >
                        {isLogin ? "Daftar Sekarang" : "Log Masuk"}
                    </button>
                </p>
            </div>
        </div>
    );
}
