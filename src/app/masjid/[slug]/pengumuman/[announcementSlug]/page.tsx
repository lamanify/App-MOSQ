import { notFound } from "next/navigation";
import { PublicHeader } from "../../_components/PublicHeader";
import { PublicFooter } from "../../_components/PublicFooter";
import { BrandColorProvider } from "../../_components/BrandColorProvider";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ShareButton } from "../../_components/ShareButton";
import { StructuredData } from "@/components/StructuredData";
import { generateArticleSchema } from "@/lib/structuredData";
import { constructTenantMetadata } from "@/lib/seo";
import { getCachedMosqueBySlug, getCachedMosqueMetadata, getCachedAnnouncementBySlug } from "@/lib/cache";

interface Props {
    params: Promise<{ slug: string; announcementSlug: string }>;
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, announcementSlug } = await params;

    // Use cached mosque metadata
    const mosque = await getCachedMosqueMetadata(slug);
    if (!mosque) return { title: "Masjid Tidak Dijumpai" };

    // Use cached announcement
    const announcement = await getCachedAnnouncementBySlug(mosque.id, announcementSlug);
    if (!announcement) return { title: "Hebahan Tidak Dijumpai" };

    return constructTenantMetadata({
        mosque,
        slug,
        path: `/pengumuman/${announcementSlug}`,
        title: `${announcement.title} | ${mosque.name}`,
        description: announcement.content?.substring(0, 160) || undefined,
        type: "article",
    });
}

export default async function AnnouncementDetailPage({ params }: Props) {
    const { slug, announcementSlug } = await params;

    // Use cached mosque data
    const mosque = await getCachedMosqueBySlug(slug);

    if (!mosque) {
        notFound();
    }

    // Use cached announcement
    const announcement = await getCachedAnnouncementBySlug(mosque.id, announcementSlug);

    if (!announcement || !announcement.is_active) {
        notFound();
    }

    // Generate Structured Data
    const jsonLd = generateArticleSchema(announcement, mosque);

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-gray-50/50">
            <StructuredData data={jsonLd} />
            <PublicHeader mosque={mosque} />

            <main className="max-w-4xl mx-auto px-4 py-32 min-h-screen">
                <Link href="/pengumuman" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Hebahan
                </Link>

                <article className="bg-white rounded-[2.5rem] border border-brand/10 overflow-hidden shadow-sm">
                    {/* Header Section */}
                    <header className="p-8 md:p-12 lg:p-16 border-b border-gray-50 bg-white">
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-bold uppercase tracking-wider">
                                Hebahan & Berita
                            </span>
                            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                                <Calendar size={14} />
                                <time dateTime={announcement.created_at}>
                                    {new Date(announcement.created_at).toLocaleDateString("ms-MY", {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </time>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-8 leading-tight tracking-tight">
                            {announcement.title}
                        </h1>

                        <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-4">
                                {mosque.logo_url && (
                                    <Image
                                        src={mosque.logo_url}
                                        alt={mosque.name}
                                        width={160}
                                        height={48}
                                        className="h-12 w-auto object-contain flex-shrink-0"
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{mosque.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">Pengurusan Masjid</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Section */}
                    <div className="p-8 md:p-12 lg:p-16 bg-white">
                        <div className="prose prose-lg max-w-none text-gray-600">
                            <div className="whitespace-pre-wrap leading-relaxed text-xl font-light">
                                {announcement.content}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <footer className="p-8 md:px-16 pb-16 bg-gray-50/50 flex flex-col items-center text-center">
                        <div className="max-w-md">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Kongsi Hebahan Ini</h2>
                            <p className="text-gray-500 mb-8 font-light">Bantu kami menyebarkan maklumat ini kepada komuniti setempat.</p>

                            <div className="flex justify-center gap-4">
                                <ShareButton
                                    title={announcement.title}
                                    text={announcement.content?.substring(0, 100) || ""}
                                />
                            </div>
                        </div>
                    </footer>
                </article>

                {/* Bottom Navigation */}
                <nav className="mt-12 flex justify-center">
                    <Link href="/pengumuman" className="text-brand font-bold hover:underline underline-offset-4 decoration-current">
                        Lihat Semua Hebahan
                    </Link>
                </nav>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
