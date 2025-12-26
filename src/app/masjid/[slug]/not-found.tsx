import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E4DC] flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-mosq-gold/20 rounded-2xl">
                        <Search size={32} className="text-mosq-gold-dark" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Masjid Tidak Dijumpai
                </h2>
                <p className="text-gray-600 mb-6">
                    Laman masjid yang anda cari tidak wujud atau belum diterbitkan.
                </p>
                <Link href="/">
                    <Button className="btn-primary">
                        <Home size={18} className="mr-2" />
                        Kembali ke Laman Utama
                    </Button>
                </Link>
            </div>
        </div>
    );
}
