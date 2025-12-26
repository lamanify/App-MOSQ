"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Mosque, Announcement, Event, CommitteeMember } from "@/lib/supabase/types";
import { fetchPrayerTimes, getNextPrayer, type SimplePrayerTimes } from "@/lib/jakim";
import { getZoneByCode } from "@/lib/zones";
import {
    MapPin,
    Phone,
    Mail,

    Facebook,
    Instagram,
    Youtube,
    Video,
    Send,
    Calendar,
    Clock,
    User,
    CreditCard,
    Users,
    Megaphone,
    ChevronRight,
    ArrowRight,
    ExternalLink,
    Info,
    Heart,
    ShieldCheck,
    Landmark as MosqueIcon,
    Sunrise,
    Sun,
    Sunset,
    Moon,
    Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { WhatsAppIcon } from "./_components/WhatsAppIcon";
import { PublicHeader } from "./_components/PublicHeader";
import { PublicFooter } from "./_components/PublicFooter";
import { BrandColorProvider } from "./_components/BrandColorProvider";

interface PublicMosquePageProps {
    mosque: Mosque;
    announcements: Announcement[];
    events: Event[];
    committee: CommitteeMember[];
    initialPrayerTimes?: SimplePrayerTimes | null;
}

export function PublicMosquePage({
    mosque,
    announcements,
    events,
    committee,
    initialPrayerTimes = null,
}: PublicMosquePageProps) {
    const [prayerTimes, setPrayerTimes] = useState<SimplePrayerTimes | null>(initialPrayerTimes);
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);

    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        // If we have initial data, use it to set next prayer immediately
        if (initialPrayerTimes) {
            setPrayerTimes(initialPrayerTimes); // Ensure state is synced
            const next = getNextPrayer(initialPrayerTimes);
            setNextPrayer(next?.name || null);
        } else if (mosque.zone_code) {
            // Only fetch client-side if no initial data
            fetchPrayerTimes(mosque.zone_code).then((times) => {
                setPrayerTimes(times);
                if (times) {
                    const next = getNextPrayer(times);
                    setNextPrayer(next?.name || null);
                }
            });
        }

        const interval = setInterval(() => {
            if (prayerTimes) {
                const next = getNextPrayer(prayerTimes);
                setNextPrayer(next?.name || null);
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [mosque.zone_code, prayerTimes, initialPrayerTimes]);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Get brand color or default
    const brandColor = mosque.brand_color || "#4F46E5";

    // Generate a slightly darker color for hover states
    const adjustColorBrightness = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    };

    const brandColorDark = adjustColorBrightness(brandColor, -15);
    const brandColorLight = adjustColorBrightness(brandColor, 40);

    return (
        <BrandColorProvider brandColor={brandColor}>
            {/* Sticky Modern Header */}
            <PublicHeader mosque={mosque} />

            {/* Immersive Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-[1.02] opacity-20"
                    style={{
                        backgroundImage: mosque.hero_image_url
                            ? `url(${mosque.hero_image_url})`
                            : "url('https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-white" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mt-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand mb-8 animate-fade-up">
                        <ShieldCheck size={14} strokeWidth={2} className="text-brand" />
                        <span className="text-sm font-bold tracking-wide">Portal Rasmi Masjid</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-gray-900 mb-6 leading-[0.9] tracking-tight animate-fade-up delay-100">
                        {mosque.name}
                    </h1>

                    {mosque.tagline && (
                        <p className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed mb-10 animate-fade-up delay-200">
                            {mosque.tagline}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
                        <Link
                            href="/pengumuman"
                            className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-full font-bold text-lg hover:bg-brand/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xl"
                        >
                            <Info size={20} strokeWidth={1.5} />
                            Info Terkini
                        </Link>
                        <Link
                            href="/dana"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-900 border border-gray-200 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <Heart size={20} strokeWidth={1.5} style={{ color: brandColor }} />
                            Infak Masjid
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* Prayer Times - Premium Cards */}
            {prayerTimes && (
                <section id="info" className="relative z-20 -mt-24 px-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-brand/10 p-2 shadow-sm">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {[
                                    { name: "Subuh", time: prayerTimes.subuh, icon: Sunrise },
                                    { name: "Syuruk", time: prayerTimes.syuruk, icon: Sun },
                                    { name: "Zohor", time: prayerTimes.zohor, icon: Sun },
                                    { name: "Asar", time: prayerTimes.asar, icon: Sun },
                                    { name: "Maghrib", time: prayerTimes.maghrib, icon: Sunset },
                                    { name: "Isyak", time: prayerTimes.isyak, icon: Moon },
                                ].map((prayer, idx) => {
                                    const isNext = prayer.name === nextPrayer;

                                    // Calculate Iqamah time (10 mins after)
                                    const getIqamahTime = (timeStr: string) => {
                                        try {
                                            const [h, m] = timeStr.split(':').map(Number);
                                            let newM = m + 10;
                                            let newH = h;
                                            if (newM >= 60) {
                                                newM -= 60;
                                                newH = (newH + 1) % 24;
                                            }
                                            // Handle converting specific times formats if necessary, but assuming HH:mm 24h from API
                                            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
                                        } catch (e) {
                                            return timeStr;
                                        }
                                    };

                                    return (
                                        <div
                                            key={prayer.name}
                                            className={`relative group p-6 rounded-[2rem] transition-all duration-300 overflow-hidden min-h-[160px] flex flex-col justify-between text-left ${isNext
                                                ? "bg-brand text-white scale-105 shadow-xl shadow-brand/20"
                                                : "bg-white border border-brand/10"
                                                }`}
                                        >
                                            {/* Top Row: Name & Icon */}
                                            <div className="flex justify-between items-start w-full mb-2">
                                                <p className={`text-sm font-bold uppercase tracking-wider ${isNext ? "text-emerald-100" : "text-gray-400"
                                                    }`}>
                                                    {prayer.name}
                                                </p>
                                                <div
                                                    className={`p-2 rounded-xl transition-colors ${isNext ? "bg-white/20 text-white backdrop-blur-sm" : "bg-gray-50 text-gray-400 group-hover:bg-brand group-hover:text-white"}`}
                                                >
                                                    <prayer.icon size={20} strokeWidth={1.5} />
                                                </div>
                                            </div>

                                            {/* Middle: Time */}
                                            <div className="mt-auto">
                                                <p className={`text-4xl lg:text-5xl font-heading font-black tracking-tight ${isNext ? "text-white" : "text-gray-900"
                                                    }`}>
                                                    {prayer.time}
                                                </p>
                                            </div>

                                            {/* Bottom: Iqamah */}
                                            <div className={`mt-4 pt-4 border-t flex items-center gap-2 ${isNext ? "border-white/20 text-blue-50" : "border-gray-100 text-gray-400"
                                                }`}>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isNext ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    Iqamah
                                                </div>
                                                <p className="text-sm font-bold tabular-nums">
                                                    {prayer.name === "Syuruk" ? "-" : getIqamahTime(prayer.time)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-gray-50/80 rounded-[2rem] mt-2 gap-4">
                                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                                    {currentTime && (
                                        <div className="flex items-center gap-3 px-4 py-2 bg-brand/5 rounded-xl border border-brand/10">
                                            <Clock size={16} className="animate-pulse text-brand" />
                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                <span className="text-sm font-bold text-gray-900 tabular-nums">
                                                    {currentTime.toLocaleTimeString("ms-MY", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true
                                                    })}
                                                </span>
                                                <span className="hidden md:block w-px h-3 bg-gray-200" />
                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    {currentTime.toLocaleDateString("ms-MY", {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Zon {mosque.zone_code}, {getZoneByCode(mosque.zone_code || "")?.state} • {prayerTimes.hijri}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-gray-400">
                                    Sumber: e-Solat JAKIM
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Announcements - Bento Grid Style */}
            {announcements.length > 0 && (
                <section id="pengumuman" className="py-24 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-heading font-black text-gray-900 mb-4 tracking-tight">
                                    Hebahan <span className="text-gray-300">&</span> Berita
                                </h2>
                                <p className="text-lg text-gray-500 max-w-xl">
                                    Dapatkan maklumat terkini mengenai aktiviti dan pengumuman penting masjid.
                                </p>
                            </div>
                            <Link href="/pengumuman" className="group flex items-center gap-2 px-6 py-3 bg-brand/10 rounded-full text-sm font-bold text-brand hover:bg-brand/20 transition-all">
                                Lihat Semua
                                <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="bento-grid">
                            {announcements.map((announcement, idx) => (
                                <Link
                                    key={announcement.id}
                                    href={`/pengumuman/${announcement.slug || announcement.id}`}
                                    className={`
                                        group relative p-8 rounded-[2rem] border border-gray-100 bg-white hover:border-gray-200 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] block
                                        ${idx === 0 ? 'md:col-span-2 bg-gradient-to-br from-gray-50 to-white' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`
                                            px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5
                                            ${idx === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            <Bell size={10} strokeWidth={2} />
                                            Pengumuman
                                        </span>
                                        <span className="text-sm font-medium text-gray-400">
                                            {new Date(announcement.created_at).toLocaleDateString("ms-MY")}
                                        </span>
                                    </div>

                                    <h3 className={`font-heading font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors ${idx === 0 ? 'text-3xl' : 'text-xl'}`}>
                                        {announcement.title}
                                    </h3>

                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                                        {announcement.content}
                                    </p>

                                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center">
                                            <ArrowRight size={18} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Layout Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Events Section - Horizontal Scroll or Grid */}
            {events.length > 0 && (
                <section id="aktiviti" className="py-24 px-4 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
                                    <Calendar size={24} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-4xl font-heading font-black text-gray-900 tracking-tight">Kuliah & Program</h2>
                            </div>
                            <Link href="/aktiviti" className="group flex items-center gap-2 px-6 py-3 bg-brand/10 rounded-full text-sm font-bold text-brand hover:bg-brand/20 transition-all">
                                Lihat Semua
                                <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event) => (
                                <Link href={`/aktiviti/${event.slug || event.id}`} key={event.id} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block">
                                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                        {event.featured_image_url ? (
                                            <img
                                                src={event.featured_image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-brand-dark p-8 text-center border-b border-brand/20">
                                                <h3 className="text-2xl md:text-3xl font-heading font-black text-white leading-tight">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-center shadow-lg">
                                            <p className="text-xs font-bold uppercase text-gray-400">
                                                {new Date(event.event_date).toLocaleString("ms-MY", { month: "short" })}
                                            </p>
                                            <p className="text-xl font-black text-gray-900 leading-none">
                                                {new Date(event.event_date).getDate()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-4">
                                            {event.event_time && (
                                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                                    <Clock size={18} strokeWidth={1.5} className="text-brand" />
                                                    <span>{event.event_time}</span>
                                                </div>
                                            )}
                                            {event.speaker && (
                                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                                    <User size={18} strokeWidth={1.5} className="text-brand" />
                                                    <span>{event.speaker}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Donation Section - Modern Dark */}
            {(mosque.bank_name || mosque.donation_qr_url) && (
                <section id="dana" className="py-24 px-4 bg-gray-900 text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-5xl md:text-6xl font-heading font-black mb-8 leading-tight">
                                    Infak untuk <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-mosq-gold to-yellow-200">
                                        Saham Akhirat
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-lg">
                                    Sumbangan anda membantu mengimarahkan masjid dan membiayai aktiviti dakwah komuniti.
                                </p>

                                <div className="space-y-6">
                                    {mosque.bank_name && (
                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-2">Saluran Bank</p>
                                            <p className="text-2xl font-bold mb-1">{mosque.bank_name}</p>
                                            <div className="flex items-center gap-4">
                                                <p className="text-3xl md:text-4xl font-mono text-brand tracking-tight">
                                                    {mosque.bank_account_number}
                                                </p>
                                                {/* Copy button could go here */}
                                            </div>
                                            {mosque.bank_account_name && (
                                                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-white/5">
                                                    {mosque.bank_account_name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-end">
                                {mosque.donation_qr_url && (
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 w-full max-w-sm">
                                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6 border-2 border-dashed border-gray-200 flex items-center justify-center p-4">
                                            <Image
                                                src={mosque.donation_qr_url}
                                                alt="QR DuitNow"
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-900 font-bold text-lg">Imbas DuitNow QR</p>
                                            <p className="text-gray-500 text-sm">Terima kasih atas sumbangan anda</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Committee Members Section */}
            {committee.length > 0 && (
                <section className="py-24 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                                    <Users size={24} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-4xl font-heading font-black text-gray-900 tracking-tight">Senarai AJK</h2>
                            </div>
                            <Link href="/ajk" className="group flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all">
                                Lihat Semua
                                <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {committee.slice(0, 4).map((member) => (
                                <div
                                    key={member.id}
                                    className="group relative p-8 rounded-[2rem] bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center justify-center min-h-[160px]"
                                >
                                    <h3 className="font-heading font-bold text-xl text-gray-900 mb-2 group-hover:text-brand transition-colors text-center">
                                        {member.name}
                                    </h3>
                                    <p className="text-brand font-bold uppercase tracking-wider text-xs">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section id="hubungi" className="py-24 px-4 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                            <MapPin size={24} />
                        </div>
                        <h2 className="text-4xl font-heading font-black text-gray-900 tracking-tight">Hubungi Kami</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Contact Info */}
                        <div className="space-y-8">
                            {/* Address Card */}
                            {mosque.address && (
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                                            <MapPin size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2">Alamat</h4>
                                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{mosque.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Phone & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mosque.phone && (
                                    <a
                                        href={`tel:${mosque.phone}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-brand group-hover:text-white transition-colors">
                                                <Phone size={20} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Telefon</p>
                                                <p className="font-bold text-gray-900">{mosque.phone}</p>
                                            </div>
                                        </div>
                                    </a>
                                )}
                                {mosque.email && (
                                    <a
                                        href={`mailto:${mosque.email}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-brand group-hover:text-white transition-colors">
                                                <Mail size={20} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">E-mel</p>
                                                <p className="font-bold text-gray-900 text-sm truncate">{mosque.email}</p>
                                            </div>
                                        </div>
                                    </a>
                                )}
                            </div>

                            {/* WhatsApp CTA */}
                            {mosque.whatsapp_link && (
                                <a
                                    href={`https://wa.me/${mosque.whatsapp_link.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 bg-[#25D366] text-white p-6 rounded-2xl hover:shadow-lg transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <WhatsAppIcon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">WhatsApp Kami</p>
                                        <p className="text-white/80 text-sm">Tekan untuk berhubung terus</p>
                                    </div>
                                    <ChevronRight size={24} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}

                            {/* Social Links */}
                            {(mosque.facebook_url || mosque.instagram_url || mosque.telegram_url || mosque.tiktok_url || mosque.youtube_url) && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ikuti Kami</p>
                                    <div className="flex gap-3">
                                        {mosque.facebook_url && (
                                            <a
                                                href={mosque.facebook_url.startsWith('http') ? mosque.facebook_url : `https://${mosque.facebook_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <Facebook size={22} strokeWidth={1.5} />
                                            </a>
                                        )}
                                        {mosque.instagram_url && (
                                            <a
                                                href={mosque.instagram_url.startsWith('http') ? mosque.instagram_url : `https://${mosque.instagram_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all"
                                            >
                                                <Instagram size={22} strokeWidth={1.5} />
                                            </a>
                                        )}
                                        {mosque.telegram_url && (
                                            <a
                                                href={mosque.telegram_url.startsWith('http') ? mosque.telegram_url : `https://${mosque.telegram_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                                <Send size={22} strokeWidth={1.5} />
                                            </a>
                                        )}
                                        {mosque.tiktok_url && (
                                            <a
                                                href={mosque.tiktok_url.startsWith('http') ? mosque.tiktok_url : `https://${mosque.tiktok_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all"
                                            >
                                                <Video size={22} strokeWidth={1.5} />
                                            </a>
                                        )}
                                        {mosque.youtube_url && (
                                            <a
                                                href={mosque.youtube_url.startsWith('http') ? mosque.youtube_url : `https://${mosque.youtube_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <Youtube size={22} strokeWidth={1.5} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Map */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                            {mosque.latitude && mosque.longitude ? (
                                <iframe
                                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3983.5!2d${mosque.longitude}!3d${mosque.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2smy!4v1`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: "400px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Lokasi ${mosque.name}`}
                                />
                            ) : (
                                <div className="w-full h-full min-h-[400px] bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                    <MapPin size={48} strokeWidth={1} className="mb-4" />
                                    <p className="font-medium">Lokasi peta tidak tersedia</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
