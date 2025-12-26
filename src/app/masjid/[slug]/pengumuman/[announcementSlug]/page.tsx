import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../_components/PublicHeader";
import { PublicFooter } from "../../_components/PublicFooter";
import { BrandColorProvider } from "../../_components/BrandColorProvider";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { ShareButton } from "../_components/ShareButton";

interface Props {
    params: Promise<{ slug: string; announcementSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, announcementSlug } = await params;
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(announcementSlug);

    const { data: announcement } = await supabase
        .from("announcements")
        .select("*")
        .or(`slug.eq.${announcementSlug}${isUuid ? `,id.eq.${announcementSlug}` : ""}`)
        .single();

    if (!announcement) return { title: "Hebahan Tidak Dijumpai" };

    return {
        title: `${announcement.title} | MOSQ`,
        description: announcement.content?.substring(0, 160) || `Hebahan daripada masjid`,
    };
}

export default async function AnnouncementDetailPage({ params }: Props) {
    const { slug, announcementSlug } = await params;
    const supabase = await createClient();

    const { data: mosque } = await supabase
        .from("mosques")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!mosque) {
        notFound();
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(announcementSlug);

    const { data: announcement } = await supabase
        .from("announcements")
        .select("*")
        .or(`slug.eq.${announcementSlug}${isUuid ? `,id.eq.${announcementSlug}` : ""}`)
        .eq("mosque_id", mosque.id)
        .single();

    if (!announcement || !announcement.is_active) {
        notFound();
    }

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-gray-50/50">
            <PublicHeader mosque={mosque} />

            <main className="max-w-4xl mx-auto px-4 py-32 min-h-screen">
                <Link href="/pengumuman" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Hebahan
                </Link>

                <article className="bg-white rounded-[2.5rem] border border-brand/10 overflow-hidden shadow-sm">
                    {/* Header Section */}
                    <div className="p-8 md:p-12 lg:p-16 border-b border-gray-50 bg-white">
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-bold uppercase tracking-wider">
                                Hebahan & Berita
                            </span>
                            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                <Calendar size={14} />
                                <span>
                                    {new Date(announcement.created_at).toLocaleDateString("ms-MY", {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-8 leading-tight tracking-tight">
                            {announcement.title}
                        </h1>

                        <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-4">
                                {mosque.logo_url && (
                                    <div className="w-12 h-12 rounded-full border border-gray-100 p-2 bg-white overflow-hidden flex-shrink-0">
                                        <img src={mosque.logo_url} alt={mosque.name} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{mosque.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">Pengurusan Masjid</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-12 lg:p-16 bg-white">
                        <div className="prose prose-lg max-w-none text-gray-600">
                            <div className="whitespace-pre-wrap leading-relaxed text-xl font-light">
                                {announcement.content}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 md:px-16 pb-16 bg-gray-50/50 flex flex-col items-center text-center">
                        <div className="max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Kongsi Hebahan Ini</h3>
                            <p className="text-gray-500 mb-8 font-light">Bantu kami menyebarkan maklumat ini kepada komuniti setempat.</p>

                            <div className="flex justify-center gap-4">
                                <ShareButton
                                    title={announcement.title}
                                    text={announcement.content?.substring(0, 100) || ""}
                                />
                            </div>
                        </div>
                    </div>
                </article>

                {/* Bottom Navigation */}
                <div className="mt-12 flex justify-center">
                    <Link href="/pengumuman" className="text-brand font-bold hover:underline underline-offset-4 decoration-current">
                        Lihat Semua Hebahan
                    </Link>
                </div>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
