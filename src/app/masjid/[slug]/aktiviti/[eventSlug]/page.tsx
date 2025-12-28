import { notFound } from "next/navigation";
import { PublicHeader } from "../../_components/PublicHeader";
import { PublicFooter } from "../../_components/PublicFooter";
import { BrandColorProvider } from "../../_components/BrandColorProvider";
import { Calendar, Clock, User, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ShareButton } from "../../_components/ShareButton";
import { StructuredData } from "@/components/StructuredData";
import { generateEventSchema } from "@/lib/structuredData";
import { constructTenantMetadata } from "@/lib/seo";
import { getCachedMosqueBySlug, getCachedMosqueMetadata, getCachedEventBySlug } from "@/lib/cache";

interface Props {
    params: Promise<{ slug: string; eventSlug: string }>;
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, eventSlug } = await params;

    // Use cached mosque metadata
    const mosque = await getCachedMosqueMetadata(slug);
    if (!mosque) return { title: "Masjid Tidak Dijumpai" };

    // Use cached event
    const event = await getCachedEventBySlug(mosque.id, eventSlug);
    if (!event) return { title: "Program Tidak Dijumpai" };

    return constructTenantMetadata({
        mosque,
        slug,
        path: `/aktiviti/${eventSlug}`,
        title: `${event.title} | ${mosque.name}`,
        description: event.description?.substring(0, 160) || undefined,
        image: event.featured_image_url || undefined,
        type: "article",
    });
}

export default async function AktivitiDetailPage({ params }: Props) {
    const { slug, eventSlug } = await params;

    // Use cached mosque data
    const mosque = await getCachedMosqueBySlug(slug);

    if (!mosque) {
        notFound();
    }

    // Use cached event
    const event = await getCachedEventBySlug(mosque.id, eventSlug);

    if (!event) {
        notFound();
    }

    // Generate Structured Data
    const jsonLd = generateEventSchema(event, mosque);

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-gray-50/50">
            <StructuredData data={jsonLd} />
            <PublicHeader mosque={mosque} />

            <main className="max-w-7xl mx-auto px-4 py-32 min-h-screen">
                <Link href="/aktiviti" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Kembali ke Senarai
                </Link>

                <article className="bg-white rounded-[2.5rem] border border-brand/10 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Section */}
                        <figure className="relative bg-gray-100 min-h-[400px] lg:min-h-full">
                            {event.featured_image_url ? (
                                <Image
                                    src={event.featured_image_url}
                                    alt={event.title}
                                    fill
                                    className="object-contain p-4"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-dark text-white p-12 text-center">
                                    <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight">
                                        {event.title}
                                    </h2>
                                </div>
                            )}
                        </figure>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 lg:p-16">
                            <div className="flex flex-col h-full justify-center">
                                <header className="mb-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-bold uppercase tracking-wider">
                                            Program
                                        </span>
                                        <time dateTime={event.created_at} className="text-gray-400 font-medium text-sm">
                                            {new Date(event.created_at).toLocaleDateString("ms-MY")}
                                        </time>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-gray-900 leading-tight">
                                        {event.title}
                                    </h1>
                                </header>

                                <dl className="space-y-6 mb-12">
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                            <Calendar size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarikh</dt>
                                            <dd className="font-bold text-lg">
                                                <time dateTime={event.event_date}>
                                                    {new Date(event.event_date).toLocaleDateString("ms-MY", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </time>
                                            </dd>
                                        </div>
                                    </div>

                                    {event.event_time && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <Clock size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Masa</dt>
                                                <dd className="font-bold text-lg">{event.event_time}</dd>
                                            </div>
                                        </div>
                                    )}

                                    {event.speaker && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <User size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Penceramah</dt>
                                                <dd className="font-bold text-lg">{event.speaker}</dd>
                                            </div>
                                        </div>
                                    )}

                                    {event.location && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <MapPin size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</dt>
                                                <dd className="font-bold text-lg">{event.location}</dd>
                                            </div>
                                        </div>
                                    )}
                                </dl>

                                {event.description && (
                                    <section className="prose prose-lg text-gray-600 mb-12">
                                        <p className="whitespace-pre-wrap">{event.description}</p>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <footer className="p-8 md:px-16 pb-16 bg-gray-50/50 flex flex-col items-center text-center">
                        <div className="max-w-md">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Kongsi Program Ini</h2>
                            <p className="text-gray-500 mb-8 font-light">Bantu kami menyebarkan maklumat ini kepada komuniti setempat.</p>

                            <div className="flex justify-center gap-4">
                                <ShareButton
                                    title={event.title}
                                    text={event.description?.substring(0, 100) || ""}
                                />
                            </div>
                        </div>
                    </footer>
                </article>
            </main>
            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
