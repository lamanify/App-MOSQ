"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mosque } from "@/lib/supabase/types";
import { Info, Calendar, Heart, Phone, Users, Landmark as MosqueIcon, Menu, X } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface PublicHeaderProps {
    mosque: Mosque;
}

export function PublicHeader({ mosque }: PublicHeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Toggle scroll lock when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    const navItems = [
        { name: "Hebahan", href: "/pengumuman", icon: Info },
        { name: "Aktiviti", href: "/aktiviti", icon: Calendar },
        { name: "AJK", href: "/ajk", icon: Users },
        { name: "Infak", href: "/dana", icon: Heart },
        { name: "Hubungi", href: "/hubungi-kami", icon: Phone },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled || mobileMenuOpen
                    ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-brand/10 py-3"
                    : "bg-transparent py-4 md:py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group z-50 relative" onClick={() => setMobileMenuOpen(false)}>
                        {mosque.logo_url && (
                            <Image
                                src={mosque.logo_url}
                                alt={mosque.name}
                                width={160}
                                height={48}
                                className="h-10 md:h-12 w-auto object-contain flex-shrink-0"
                            />
                        )}
                        <span className={`font-heading font-bold text-lg md:text-xl tracking-tight transition-colors truncate max-w-[200px] md:max-w-none ${scrolled || mobileMenuOpen ? "text-gray-900" : "text-gray-900"
                            }`}>
                            {mosque.name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
                        {navItems.map((item) => (
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

                    <div className="flex items-center gap-2 z-50 relative">
                        {mosque.whatsapp_link && (
                            <a
                                href={`https://api.whatsapp.com/send/?phone=${mosque.whatsapp_link.replace(/[^0-9]/g, "").startsWith('6') ? mosque.whatsapp_link.replace(/[^0-9]/g, "") : '6' + mosque.whatsapp_link.replace(/[^0-9]/g, "")}`}
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

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 md:hidden rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} strokeWidth={1.5} />
                            ) : (
                                <Menu size={24} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 transition-all duration-300 md:hidden flex flex-col pt-24 px-6 ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
                    }`}
            >
                <div className="flex flex-col gap-2">
                    {navItems.map((item, idx) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-brand/5 transition-all text-gray-900 hover:text-brand group"
                            style={{
                                transitionDelay: mobileMenuOpen ? `${idx * 50}ms` : '0ms'
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                <item.icon size={20} strokeWidth={1.5} />
                            </div>
                            <span className="font-heading font-bold text-lg">{item.name}</span>
                        </Link>
                    ))}

                    {/* Mobile WhatsApp Button */}
                    {mosque.whatsapp_link && (
                        <a
                            href={`https://api.whatsapp.com/send/?phone=${mosque.whatsapp_link.replace(/[^0-9]/g, "").startsWith('6') ? mosque.whatsapp_link.replace(/[^0-9]/g, "") : '6' + mosque.whatsapp_link.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold font-heading text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-lg transition-all"
                        >
                            <WhatsAppIcon size={20} />
                            <span>WhatsApp Kami</span>
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
