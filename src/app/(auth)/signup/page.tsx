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

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
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

    return (
        <div className="glass-card p-8 animate-slide-up">
            {/* Logo & Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-sm">
                    <span className="text-2xl font-bold text-white">M</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Daftar Akaun</h1>
                <p className="text-gray-600 mt-2">Bina laman web masjid percuma</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className="form-label">
                        Nama Penuh
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama penuh anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-input"
                        autoComplete="name"
                    />
                </div>

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
                            placeholder="Minimum 6 aksara"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="form-input pr-12"
                            autoComplete="new-password"
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="form-label">
                        Sahkan Kata Laluan
                    </Label>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan semula kata laluan"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="form-input"
                        autoComplete="new-password"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sedang mendaftar...
                        </>
                    ) : (
                        "Daftar Sekarang"
                    )}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Sudah ada akaun?{" "}
                    <Link
                        href="/login"
                        className="text-black hover:underline font-bold"
                    >
                        Log Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}
