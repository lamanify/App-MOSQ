"use client";

import type { Mosque, Announcement } from "@/lib/supabase/types";
import Link from "next/link";

interface InfoContentProps {
    mosque: Mosque;
    announcements: Announcement[];
}

export function InfoContent({ announcements }: InfoContentProps) {
    return (
        <div className="space-y-16">
            {/* Announcements List */}
            {announcements.length > 0 ? (
                <section id="pengumuman">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {announcements.map((announcement) => (
                            <Link
                                key={announcement.id}
                                href={`/pengumuman/${announcement.slug || announcement.id}`}
                                className="group p-8 bg-white border border-brand/10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 hover:border-brand/30"
                            >
                                <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">
                                    {new Date(announcement.created_at).toLocaleDateString("ms-MY", { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors">
                                    {announcement.title}
                                </h3>
                                <div className="text-gray-500 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                    {announcement.content}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">Tiada hebahan atau berita buat masa ini.</p>
                </div>
            )}
        </div>
    );
}
