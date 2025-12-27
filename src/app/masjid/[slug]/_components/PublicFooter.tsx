// Server component - no client-side JavaScript needed

import Link from "next/link";
import Image from "next/image";
import { Mosque } from "@/lib/supabase/types";
import { Landmark as MosqueIcon, Phone, Mail, Facebook, Instagram, Send } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface PublicFooterProps {
    mosque: Mosque;
}

export function PublicFooter({ mosque }: PublicFooterProps) {
    return (
        <footer className="bg-white pt-24 pb-12 border-t border-brand/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            {mosque.logo_url && (
                                <Image
                                    src={mosque.logo_url}
                                    alt={mosque.name}
                                    width={160}
                                    height={48}
                                    className="h-12 w-auto object-contain flex-shrink-0"
                                />
                            )}
                            <span className="font-heading font-bold text-2xl text-gray-900 tracking-tight">
                                {mosque.name}
                            </span>
                        </Link>
                        {mosque.about_text && (
                            <p className="text-gray-500 leading-relaxed max-w-md">
                                {mosque.about_text}
                            </p>
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Pautan Pantas</h4>
                        <ul className="space-y-4">
                            {[
                                { name: "Hebahan", href: "/pengumuman" },
                                { name: "Aktiviti", href: "/aktiviti" },
                                { name: "AJK", href: "/ajk" },
                                { name: "Infak", href: "/dana" },
                                { name: "Hubungi", href: "/hubungi-kami" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-500 hover:text-brand transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Hubungi</h4>
                        <ul className="space-y-4">
                            {mosque.phone && (
                                <li>
                                    <a href={`tel:${mosque.phone}`} className="flex items-center gap-3 text-gray-500 hover:text-brand transition-colors">
                                        <Phone size={18} strokeWidth={1.5} />
                                        <span>{mosque.phone}</span>
                                    </a>
                                </li>
                            )}
                            {mosque.email && (
                                <li>
                                    <a href={`mailto:${mosque.email}`} className="flex items-center gap-3 text-gray-500 hover:text-brand transition-colors">
                                        <Mail size={18} strokeWidth={1.5} />
                                        <span>{mosque.email}</span>
                                    </a>
                                </li>
                            )}
                        </ul>

                        <div className="flex gap-4 mt-8">
                            {mosque.facebook_url && (
                                <a
                                    href={mosque.facebook_url.startsWith('http') ? mosque.facebook_url : `https://${mosque.facebook_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    <Facebook size={18} strokeWidth={1.5} />
                                </a>
                            )}
                            {mosque.instagram_url && (
                                <a
                                    href={mosque.instagram_url.startsWith('http') ? mosque.instagram_url : `https://${mosque.instagram_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition-all"
                                >
                                    <Instagram size={18} strokeWidth={1.5} />
                                </a>
                            )}
                            {mosque.telegram_url && (
                                <a
                                    href={mosque.telegram_url.startsWith('http') ? mosque.telegram_url : `https://${mosque.telegram_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    <Send size={18} strokeWidth={1.5} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer Copyright Section */}
            <div className="border-t border-brand/5 mt-12 pt-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left: Mosque Copyright */}
                    <div className="text-sm text-gray-500 text-center md:text-left">
                        <p>&copy; {new Date().getFullYear()} {mosque.name}. Hak Cipta Terpelihara.</p>
                    </div>

                    {/* Right: MOSQ Branding */}
                    <div className="text-sm text-right text-center md:text-right">
                        <p className="font-bold text-gray-700">
                            Laman web ini disediakan secara percuma melalui inisiatif{' '}
                            <a
                                href="https://Mosq.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand hover:underline"
                            >
                                MOSQ
                            </a>.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            MOSQ ialah inisiatif digital untuk masjid.
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for WhatsApp */}
            {mosque.whatsapp_link && (
                <a
                    href={`https://wa.me/${mosque.whatsapp_link.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_8px_40px_rgb(37,211,102,0.6)] transition-all duration-300 group"
                >
                    <WhatsAppIcon size={32} />
                    <span className="absolute right-full mr-4 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
                        WhatsApp Kami
                    </span>
                </a>
            )}
        </footer>
    );
}
