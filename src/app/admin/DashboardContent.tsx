"use client";

import Link from "next/link";
import type { Mosque } from "@/lib/supabase/types";
import {
    Megaphone,
    Calendar,
    Users,
    Plus,
    ExternalLink,
    Clock,
    Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
    mosque: Mosque;
    adminName: string;
    stats: {
        announcements: number;
        events: number;
        committee: number;
    };
    recentAnnouncements: Array<{
        id: string;
        title: string;
        created_at: string;
    }>;
}

export function DashboardContent({
    mosque,
    adminName,
    stats,
    recentAnnouncements,
}: DashboardContentProps) {
    const publicUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
        ? `http://${mosque.slug}.localhost:3000`
        : `https://${mosque.slug}.mosq.io`;

    return (
        <div className="space-y-8 animate-fade-in text-gray-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span>MOSQ</span>
                        <span className="text-gray-300">/</span>
                        <span>Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">
                        Selamat Datang, {adminName}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center px-4 py-2 bg-white rounded-lg border border-gray-100 text-sm font-medium text-gray-600 gap-2 shadow-sm">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
                    </div>
                    <Link
                        href={publicUrl}
                        target="_blank"
                    >
                        <Button className="bg-black text-white hover:bg-zinc-800 shadow-sm">
                            Lihat Laman Web
                            <ExternalLink size={14} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-600 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            Lengkapkan profil masjid anda untuk paparan laman web yang lebih menarik.
                        </p>
                        {/* Link removed as requested */}
                    </div>
                </div>
                <Link href="/admin/tetapan">
                    <Button
                        className="bg-white text-blue-600 hover:bg-blue-50 border-0 whitespace-nowrap shrink-0 font-bold"
                    >
                        Kemaskini Profil
                    </Button>
                </Link>
            </div>

            {/* Stats Grid - Spendly Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[
                    {
                        label: "Pengumuman Aktif",
                        value: stats.announcements,
                        icon: Megaphone,
                        trend: "+2",
                        trendLabel: "bulan ini"
                    },
                    {
                        label: "Aktiviti Bulan Ini",
                        value: stats.events,
                        icon: Calendar,
                        trend: "+4",
                        trendLabel: "akan datang"
                    },
                    {
                        label: "Ahli Jawatankuasa",
                        value: stats.committee,
                        icon: Users,
                        trend: "+0",
                        trendLabel: "stabil"
                    },
                    {
                        label: "Status Web",
                        value: mosque.is_published ? "Aktif" : "Draf",
                        icon: Building,
                        trend: "Online",
                        trendLabel: "24/7"
                    }
                ].map((stat, idx) => (
                    <div key={idx} className="dashboard-card p-4 sm:p-6 flex flex-col justify-between h-32 sm:h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight">{stat.label}</span>
                            <div className="p-1.5 sm:p-2 rounded-lg border border-gray-100 text-gray-400 bg-gray-50">
                                <stat.icon size={14} strokeWidth={1.5} className="sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-heading font-black text-black tracking-tight mb-1 sm:mb-2">
                                {stat.value}
                            </h3>
                            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                                <span>{stat.trend}</span>
                                <span className="font-medium text-gray-500">{stat.trendLabel}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-heading font-bold text-gray-900">Tindakan Pantas</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/pengumuman?new=true" className="group dashboard-card p-6 hover:border-black transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-black mb-4 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                <Plus size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-heading font-bold text-black mb-1">Tambah Pengumuman</h3>
                            <p className="text-sm text-gray-500">
                                Beritahu jemaah mengenai berita terkini masjid.
                            </p>
                        </Link>
                        <Link href="/admin/aktiviti?new=true" className="group dashboard-card p-6 hover:border-black transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-black mb-4 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                <Calendar size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-heading font-bold text-black mb-1">Tambah Aktiviti</h3>
                            <p className="text-sm text-gray-500">
                                Rancang kuliah dan program imarah masjid.
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Recent Announcements */}
                <div className="dashboard-card flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pengumuman Terkini</h3>
                    </div>
                    <div className="p-5 flex-1">
                        {recentAnnouncements.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Clock size={24} className="text-gray-200 mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Tiada pengumuman lagi</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentAnnouncements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="py-3 flex flex-col gap-1 first:pt-0 last:pb-0"
                                    >
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {announcement.title}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            {new Date(announcement.created_at).toLocaleDateString("ms-MY", {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                        <Link href="/admin/pengumuman" className="block text-center">
                            <span className="text-[10px] font-black text-black uppercase tracking-widest hover:underline transition-all">
                                Lihat Semua
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
