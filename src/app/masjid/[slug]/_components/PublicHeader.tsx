"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mosque } from "@/lib/supabase/types";
import { Info, Calendar, Heart, Phone, Users, Landmark as MosqueIcon } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface PublicHeaderProps {
    mosque: Mosque;
}

export function PublicHeader({ mosque }: PublicHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
                ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-brand/10 py-3"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    {mosque.logo_url ? (
                        <Image
                            src={mosque.logo_url}
                            alt={mosque.name}
                            width={48}
                            height={48}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm bg-white"
                        />
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-md">
                            <MosqueIcon size={24} strokeWidth={1.5} />
                        </div>
                    )}
                    <span className={`font-heading font-bold text-lg md:text-xl tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-gray-900"
                        }`}>
                        {mosque.name}
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
                    {[
                        { name: "Hebahan", href: "/pengumuman", icon: Info },
                        { name: "Aktiviti", href: "/aktiviti", icon: Calendar },
                        { name: "AJK", href: "/ajk", icon: Users },
                        { name: "Infak", href: "/dana", icon: Heart },
                        { name: "Hubungi", href: "/#hubungi", icon: Phone },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${scrolled
                                ? "text-gray-600 hover:text-brand hover:bg-brand/5"
                                : "text-gray-600 hover:text-brand hover:bg-white/20"
                                }`}
                        >
                            <item.icon size={16} strokeWidth={1.5} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    {mosque.whatsapp_link && (
                        <a
                            href={`https://wa.me/${mosque.whatsapp_link.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${scrolled
                                ? "bg-brand text-white hover:bg-brand/90"
                                : "bg-brand text-white hover:bg-brand/90 shadow-xl"
                                }`}
                        >
                            <WhatsAppIcon size={18} />
                            <span>Hubungi</span>
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}
