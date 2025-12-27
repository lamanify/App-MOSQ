"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
    Shield,
} from "lucide-react";

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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const fetchMosque = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: admin } = await supabase
                .from("admins")
                .select("mosque_id, is_super_admin")
                .eq("id", user.id)
                .single();

            if (admin?.is_super_admin) {
                setIsSuperAdmin(true);
            }

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

    // Bottom nav items for mobile (subset of main nav)
    const BOTTOM_NAV_ITEMS = [
        { href: "/admin", label: "Papan Pemuka", icon: LayoutDashboard },
        { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
        { href: "/admin/aktiviti", label: "Aktiviti", icon: Calendar },
        { href: "/admin/tetapan", label: "Tetapan", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/admin" className="flex items-center gap-2">
                        <Image
                            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766798421/Mosq_7_vn5zgh.webp"
                            alt="MOSQ"
                            width={120}
                            height={64}
                            className="h-11 w-auto object-contain"
                        />
                        {mosque?.name && (
                            <span className="text-[10px] text-gray-500 truncate max-w-[140px] ml-1">{mosque.name}</span>
                        )}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-3 -mr-2 rounded-xl hover:bg-gray-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? <X size={22} className="text-gray-600" /> : <Menu size={22} className="text-gray-600" />}
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
                <div className="h-full flex flex-col pt-6 pb-24 lg:pb-4">
                    {/* Logo */}
                    <div className="px-6 mb-8">
                        <Link href="/admin" className="flex items-center gap-3">
                            <Image
                                src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766798421/Mosq_7_vn5zgh.webp"
                                alt="MOSQ"
                                width={150}
                                height={80}
                                className="h-14 w-auto object-contain"
                            />
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
                        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group min-h-[44px]
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
                        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group min-h-[44px]
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

                        {/* Super Admin Section - Only visible to super admins */}
                        {isSuperAdmin && (
                            <div>
                                <p className="px-4 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Super Admin</p>
                                <div className="space-y-1">
                                    <Link
                                        href="/admin/super-admin"
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group min-h-[44px]
                                            ${pathname === "/admin/super-admin"
                                                ? "bg-gray-100 text-black"
                                                : "text-gray-500 hover:text-black hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        {pathname === "/admin/super-admin" && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-r-full" />
                                        )}
                                        <Shield
                                            size={20}
                                            strokeWidth={1.5}
                                            className={pathname === "/admin/super-admin" ? "text-black" : "text-gray-400 group-hover:text-gray-600"}
                                        />
                                        <span className={pathname === "/admin/super-admin" ? "font-semibold" : ""}>Pengurusan Pengguna</span>
                                    </Link>
                                </div>
                            </div>
                        )}

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
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-all min-h-[44px]"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            <span>Log Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content - Added pb-20 for bottom nav on mobile */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
                <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
                <div className="flex items-center justify-around px-2 py-1">
                    {BOTTOM_NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all min-w-[64px] min-h-[56px]
                                    ${isActive
                                        ? "text-black"
                                        : "text-gray-400 hover:text-gray-600"
                                    }
                                `}
                            >
                                <div className={`
                                    p-1.5 rounded-lg transition-all
                                    ${isActive ? "bg-black text-white" : ""}
                                `}>
                                    <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                                </div>
                                <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
