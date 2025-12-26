"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="glass-card p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-2xl">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Oops! Sesuatu tidak kena
                </h2>
                <p className="text-gray-600 mb-6">
                    Ralat berlaku semasa memuatkan halaman ini. Sila cuba lagi atau hubungi sokongan jika masalah berterusan.
                </p>
                <Button onClick={reset} className="btn-primary">
                    <RefreshCw size={18} className="mr-2" />
                    Cuba Lagi
                </Button>
            </div>
        </div>
    );
}
