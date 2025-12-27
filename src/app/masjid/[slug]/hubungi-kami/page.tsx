import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../_components/PublicHeader";
import { PublicFooter } from "../_components/PublicFooter";
import { BrandColorProvider } from "../_components/BrandColorProvider";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Mail, Facebook, Instagram, Send, ChevronRight, Video, Youtube } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";
import { generateContactPageSchema, generateMosqueSchema, combineSchemas } from "@/lib/structuredData";
import { constructTenantMetadata } from "@/lib/seo";
import { WhatsAppIcon } from "../_components/WhatsAppIcon";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: mosque } = await supabase
        .from("mosques")
        .select("name, tagline, about_text, logo_url, hero_image_url, phone, email, address")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!mosque) {
        return { title: "Masjid Tidak Dijumpai" };
    }

    return constructTenantMetadata({
        mosque,
        slug,
        path: "/hubungi-kami",
        title: `Hubungi Kami | ${mosque.name}`,
        description: `Hubungi ${mosque.name}. ${mosque.address ? `Alamat: ${mosque.address.slice(0, 80)}` : ''} ${mosque.phone ? `Tel: ${mosque.phone}` : ''} ${mosque.email ? `Email: ${mosque.email}` : ''}`.trim() || mosque.tagline || `Maklumat perhubungan ${mosque.name}.`,
    });
}

export default async function HubungiKamiPage({ params }: Props) {
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

    // Generate Structured Data with ContactPage schema
    const contactPageSchema = generateContactPageSchema(mosque, {
        name: `Hubungi Kami | ${mosque.name}`,
        path: "/hubungi-kami"
    });
    const mosqueSchema = generateMosqueSchema(mosque);
    const jsonLd = combineSchemas(contactPageSchema, mosqueSchema);

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-white">
            <StructuredData data={jsonLd} />
            <PublicHeader mosque={mosque} />

            <main className="pt-24 min-h-[calc(100vh-80px)]">
                {/* Hero section */}
                <section className="relative h-[400px] md:h-[500px] flex items-center bg-brand/5 overflow-hidden border-b border-brand/10">
                    <div className="absolute inset-0 w-full h-full opacity-[0.07]">
                        <Image
                            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp"
                            alt=""
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 mb-10 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Utama
                        </Link>
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                                <MapPin size={12} />
                                Perhubungan
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heading font-black text-gray-900 mb-6 tracking-tight">
                                Hubungi Kami
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
                                Jangan segan untuk menghubungi <span className="font-bold text-gray-900">{mosque.name}</span>. Kami sedia membantu.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Content */}
                <div className="max-w-7xl mx-auto px-4 py-20">
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

                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                            {mosque.google_maps_name ? (
                                <iframe
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(mosque.google_maps_name)}&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: "500px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Lokasi ${mosque.name}`}
                                />
                            ) : mosque.latitude && mosque.longitude ? (
                                <iframe
                                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3983.5!2d${mosque.longitude}!3d${mosque.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2smy!4v1`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: "500px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Lokasi ${mosque.name}`}
                                />
                            ) : (
                                <div className="w-full h-full min-h-[500px] bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                    <MapPin size={48} strokeWidth={1} className="mb-4" />
                                    <p className="font-medium">Lokasi peta tidak tersedia</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info Section */}
                    {mosque.about_text && (
                        <div className="mt-20 bg-gray-50 rounded-[2rem] p-8 md:p-12">
                            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Tentang {mosque.name}</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{mosque.about_text}</p>
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
