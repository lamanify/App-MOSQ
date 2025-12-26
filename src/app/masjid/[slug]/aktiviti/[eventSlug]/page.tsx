import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../_components/PublicHeader";
import { PublicFooter } from "../../_components/PublicFooter";
import { BrandColorProvider } from "../../_components/BrandColorProvider";
import { Calendar, Clock, User, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string; eventSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, eventSlug } = await params;
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventSlug);

    const { data: event } = await supabase
        .from("events")
        .select("*")
        .or(`slug.eq.${eventSlug}${isUuid ? `,id.eq.${eventSlug}` : ""}`)
        .single();

    if (!event) return { title: "Program Tidak Dijumpai" };

    return {
        title: `${event.title} | MOSQ`,
        description: event.description || `Program di masjid`,
        openGraph: {
            images: event.featured_image_url ? [event.featured_image_url] : [],
        },
    };
}

export default async function AktivitiDetailPage({ params }: Props) {
    const { slug, eventSlug } = await params;
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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventSlug);

    const { data: event } = await supabase
        .from("events")
        .select("*")
        .or(`slug.eq.${eventSlug}${isUuid ? `,id.eq.${eventSlug}` : ""}`)
        .eq("mosque_id", mosque.id)
        .single();

    if (!event) {
        notFound();
    }

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-gray-50/50">
            <PublicHeader mosque={mosque} />

            <main className="max-w-7xl mx-auto px-4 py-32 min-h-screen">
                <Link href="/aktiviti" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Kembali ke Senarai
                </Link>

                <div className="bg-white rounded-[2.5rem] border border-brand/10 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative bg-gray-100 min-h-[400px] lg:min-h-full">
                            {event.featured_image_url ? (
                                <Image
                                    src={event.featured_image_url}
                                    alt={event.title}
                                    fill
                                    className="object-contain p-4"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-dark text-white p-12 text-center">
                                    <h1 className="text-3xl md:text-5xl font-heading font-black leading-tight">
                                        {event.title}
                                    </h1>
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 lg:p-16">
                            <div className="flex flex-col h-full justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-bold uppercase tracking-wider">
                                        Program
                                    </span>
                                    <span className="text-gray-400 font-medium text-sm">
                                        {new Date(event.created_at).toLocaleDateString("ms-MY")}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-gray-900 mb-8 leading-tight">
                                    {event.title}
                                </h1>

                                <div className="space-y-6 mb-12">
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                            <Calendar size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarikh</p>
                                            <p className="font-bold text-lg">
                                                {new Date(event.event_date).toLocaleDateString("ms-MY", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {event.event_time && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <Clock size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Masa</p>
                                                <p className="font-bold text-lg">{event.event_time}</p>
                                            </div>
                                        </div>
                                    )}

                                    {event.speaker && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <User size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Penceramah</p>
                                                <p className="font-bold text-lg">{event.speaker}</p>
                                            </div>
                                        </div>
                                    )}

                                    {event.location && (
                                        <div className="flex items-center gap-4 text-gray-700">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                                                <MapPin size={24} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</p>
                                                <p className="font-bold text-lg">{event.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {event.description && (
                                    <div className="prose prose-lg text-gray-600 mb-12">
                                        <p className="whitespace-pre-wrap">{event.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
