import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Zap, Globe, Users, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#F5C542_0%,transparent_50%)] opacity-10" />
        </div>

        <header className="relative z-10 max-w-6xl mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mosq-gold rounded-xl flex items-center justify-center">
                <span className="font-bold text-black">M</span>
              </div>
              <span className="font-bold text-white text-xl">MOSQ</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/80 hover:text-white">
                Log Masuk
              </Link>
              <Link href="/signup">
                <Button className="btn-primary">
                  Daftar Percuma
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/80 text-sm mb-6">
              <Zap size={16} className="text-mosq-gold" />
              100% Percuma untuk semua masjid
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Bina Laman Web Masjid dalam
              <span className="text-mosq-gold"> 5 Minit</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Platform mudah untuk membina laman web masjid yang profesional.
              Waktu solat automatik, pengumuman, aktiviti, dan banyak lagi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="btn-primary text-lg px-8 py-4">
                  Mula Sekarang — Percuma
                  <ChevronRight size={20} className="ml-2" />
                </Button>
              </Link>
              <Link href="/masjid/demo">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4">
                  Lihat Contoh
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Semua yang masjid anda perlukan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Direka khas untuk pentadbir masjid Malaysia. Mudah, cepat, dan profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Building2,
              title: "Laman Web Profesional",
              description: "Template cantik dan responsif yang sesuai untuk semua peranti.",
            },
            {
              icon: Globe,
              title: "Waktu Solat Automatik",
              description: "Integrasi JAKIM e-Solat untuk paparan waktu solat yang tepat.",
            },
            {
              icon: Users,
              title: "Pengumuman & Aktiviti",
              description: "Urus dan kongsi berita masjid dengan mudah.",
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-card p-8">
              <div className="p-3 bg-mosq-gold/20 rounded-2xl w-fit mb-4">
                <feature.icon size={28} className="text-mosq-gold-dark" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="glass-card-dark p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mulakan Sekarang — 100% Percuma
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Tiada kad kredit diperlukan. Cipta laman web masjid anda dalam beberapa minit.
          </p>
          <Link href="/signup">
            <Button className="btn-primary text-lg px-8 py-4">
              Daftar Sekarang
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-mosq-gold rounded-lg flex items-center justify-center">
                <span className="font-bold text-black text-sm">M</span>
              </div>
              <span className="font-semibold text-gray-900">MOSQ</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 MOSQ. Platform pembina laman web masjid percuma.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
