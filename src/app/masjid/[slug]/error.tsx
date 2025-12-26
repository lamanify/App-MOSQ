"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function MosqueError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Mosque page error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E4DC] flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-2xl">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Ralat Memuatkan Laman
                </h2>
                <p className="text-gray-600 mb-6">
                    Maaf, laman masjid ini tidak dapat dipaparkan. Sila cuba lagi atau kembali ke laman utama.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/">
                        <Button variant="outline">
                            <Home size={18} className="mr-2" />
                            Laman Utama
                        </Button>
                    </Link>
                    <Button onClick={reset} className="btn-primary">
                        <RefreshCw size={18} className="mr-2" />
                        Cuba Lagi
                    </Button>
                </div>
            </div>
        </div>
    );
}
