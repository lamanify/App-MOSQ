"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
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

    return (
        <div className="glass-card p-8 animate-slide-up">
            {/* Logo & Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-sm">
                    <span className="text-2xl font-bold text-white">M</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Log Masuk</h1>
                <p className="text-gray-600 mt-2">Selamat kembali ke MOSQ</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            placeholder="Masukkan kata laluan"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input pr-12"
                            autoComplete="current-password"
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

                <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sedang log masuk...
                        </>
                    ) : (
                        "Log Masuk"
                    )}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Belum ada akaun?{" "}
                    <Link
                        href="/signup"
                        className="text-black hover:underline font-bold"
                    >
                        Daftar Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
