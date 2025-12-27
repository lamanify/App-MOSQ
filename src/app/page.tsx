"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766798421/Mosq_7_vn5zgh.webp"
            alt="MOSQ Logo"
            width={240}
            height={80}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <Link href="/login" className="text-gray-600 hover:text-black font-medium transition-colors">
          Log Masuk
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full py-12 lg:py-0">

          {/* Left Column: Copy */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-800 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              100% Percuma untuk semua masjid
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-black tracking-tight leading-[1.1]">
              Bina laman web masjid <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">dalam 5 minit.</span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              Sistem pengurusan masjid yang lengkap dengan waktu solat, kutipan derma, dan info aktiviti. Semuanya percuma.
            </p>

            <div className="flex flex-col gap-3">
              {[
                "Paparan Waktu Solat Automatik",
                "Sistem QR Kod Derma",
                "Hebahan Aktiviti & Kuliah"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#B8860B]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Signup Form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Daftar Akaun Masjid</h3>
                <p className="text-gray-500 mt-2">Masukan butiran di bawah untuk bermula</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Penuh AJK</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Contoh: Ahmad Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mel Rasmi / AJK</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="masjid@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata Laluan</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 aksara"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-90 text-white rounded-xl mt-2 transition-all shadow-lg shadow-orange-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sedang memproses...
                    </>
                  ) : (
                    "Daftar Sekarang — Percuma"
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Dengan mendaftar, anda bersetuju dengan Terma & Syarat kami.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MOSQ. Hak Cipta Terpelihara.</p>
      </footer>
    </div>
  );
}
