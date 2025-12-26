"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Mosque } from "@/lib/supabase/types";
import {
    LayoutDashboard,
    Megaphone,
    Calendar,
    Users,
    Settings,
    Building,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { href: "/admin", label: "Papan Pemuka", icon: LayoutDashboard },
    { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
    { href: "/admin/aktiviti", label: "Aktiviti", icon: Calendar },
    { href: "/admin/ajk", label: "Senarai AJK", icon: Users },
    { href: "/admin/tetapan", label: "Tetapan", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mosque, setMosque] = useState<Mosque | null>(null);

    useEffect(() => {
        const fetchMosque = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: admin } = await supabase
                .from("admins")
                .select("mosque_id")
                .eq("id", user.id)
                .single();

            if (admin?.mosque_id) {
                const { data: mosqueData } = await supabase
                    .from("mosques")
                    .select("*")
                    .eq("id", admin.mosque_id)
                    .single();

                if (mosqueData) setMosque(mosqueData);
            }
        };

        fetchMosque();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between p-4">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="font-bold text-sm text-white">M</span>
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight text-black">MOSQ</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {sidebarOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 bg-white border-r border-gray-100
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="h-full flex flex-col pt-6 pb-4">
                    {/* Logo */}
                    <div className="px-6 mb-8">
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm">
                                <span className="font-bold text-white text-sm">M</span>
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tight text-black">MOSQ</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
                        <div>
                            <p className="px-4 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Menu</p>
                            <div className="space-y-1">
                                {NAV_ITEMS.slice(0, 3).map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                        relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium group
                        ${isActive
                                                    ? "bg-gray-100 text-black"
                                                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-r-full" />
                                            )}
                                            <Icon
                                                size={20}
                                                strokeWidth={1.5}
                                                className={isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"}
                                            />
                                            <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="px-4 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pengurusan</p>
                            <div className="space-y-1">
                                {NAV_ITEMS.slice(3).map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                        relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium group
                        ${isActive
                                                    ? "bg-gray-100 text-black"
                                                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-r-full" />
                                            )}
                                            <Icon
                                                size={20}
                                                strokeWidth={1.5}
                                                className={isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"}
                                            />
                                            <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mosque Preview Card */}
                        <div className="mt-8 px-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Building size={16} className="text-black" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-xs text-gray-900 truncate">{mosque?.name || "Masjid"}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{mosque?.slug}.mosq.io</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </nav>

                    {/* Logout */}
                    <div className="px-4 mt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-all"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            <span>Log Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
