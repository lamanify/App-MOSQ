"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { trackViewContent, trackCompleteRegistration } from "@/lib/meta-conversions";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Track page view for Meta Conversions API
    useEffect(() => {
        trackViewContent();
    }, []);

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
                // Split name into first and last name for better matching
                const nameParts = name.trim().split(" ");
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

                // Track successful registration for Meta Conversions API
                trackCompleteRegistration({
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    userId: data.user.id,
                });

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
