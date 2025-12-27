import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../_components/PublicHeader";
import { PublicFooter } from "../_components/PublicFooter";
import { BrandColorProvider } from "../_components/BrandColorProvider";
import { Calendar, Clock, User, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StructuredData } from "@/components/StructuredData";
import { generateEventSeriesSchema } from "@/lib/structuredData";

interface Props {
    params: Promise<{ slug: string }>;
}

import { constructTenantMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: mosque } = await supabase
        .from("mosques")
        .select("name, tagline, about_text, logo_url, hero_image_url")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!mosque) {
        return { title: "Masjid Tidak Dijumpai" };
    }

    return constructTenantMetadata({
        mosque,
        slug,
        path: "/aktiviti",
        title: `Aktiviti & Program | ${mosque.name}`,
        description: mosque.about_text?.slice(0, 160) || mosque.tagline || `Senarai penuh kuliah, ceramah, dan aktiviti yang akan berlangsung di ${mosque.name}.`,
    });
}

export default async function AktivitiPage({ params }: Props) {
    const { slug } = await params;
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

    const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("mosque_id", mosque.id)
        .eq("is_published", true)
        .order("event_date", { ascending: true });

    // Generate Structured Data
    const jsonLd = generateEventSeriesSchema(mosque, {
        name: `Aktiviti & Kuliah ${mosque.name}`,
        description: `Senarai penuh kuliah, ceramah, dan aktiviti yang akan berlangsung di ${mosque.name}.`
    });

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-gray-50/50">
            <StructuredData data={jsonLd} />
            <PublicHeader mosque={mosque} />

            <main className="min-h-screen pt-24 pb-24">
                {/* Hero section */}
                <section className="relative h-[400px] md:h-[500px] flex items-center bg-brand/5 overflow-hidden border-b border-brand/10">
                    <div className="absolute inset-0 w-full h-full opacity-[0.07]">
                        <Image
                            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 mb-10 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Utama
                        </Link>

                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                                <Calendar size={14} className="text-brand" />
                                Kuliah & Program
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heading font-black text-gray-900 mb-6 tracking-tight">
                                Aktiviti Masjid
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
                                Senarai penuh kuliah, ceramah, dan aktiviti yang akan berlangsung di <span className="font-bold text-gray-900">{mosque.name}</span>.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 mt-20">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events?.map((event) => (
                            <Link href={`/aktiviti/${event.slug || event.id}`} key={event.id} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block">
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                    {event.featured_image_url ? (
                                        <Image
                                            src={event.featured_image_url}
                                            alt={event.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-dark p-8 text-center">
                                            <h3 className="text-2xl md:text-3xl font-heading font-black text-white leading-tight">
                                                {event.title}
                                            </h3>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-center shadow-lg z-10">
                                        <p className="text-xs font-bold uppercase text-gray-400">
                                            {new Date(event.event_date).toLocaleString("ms-MY", { month: "short" })}
                                        </p>
                                        <p className="text-xl font-black text-gray-900 leading-none">
                                            {new Date(event.event_date).getDate()}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors line-clamp-2">
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
                                        {event.location && (
                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                                <MapPin size={18} strokeWidth={1.5} className="text-brand" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {events?.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <Calendar size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Tiada aktiviti dijadualkan buat masa ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
