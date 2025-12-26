"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: window.location.href,
            }).catch(() => {
                // Ignore errors
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Pautan telah disalin ke papan klip!");
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
            <Share2 size={20} />
            <span>Klik untuk Kongsi</span>
        </button>
    );
}
