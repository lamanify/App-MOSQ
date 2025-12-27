import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../_components/PublicHeader";
import { PublicFooter } from "../_components/PublicFooter";
import { BrandColorProvider } from "../_components/BrandColorProvider";
import { AjkContent } from "./AjkContent";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";
import { generateAboutPageSchema } from "@/lib/structuredData";

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
        path: "/ajk",
        title: `Senarai AJK | ${mosque.name}`,
        description: mosque.about_text?.slice(0, 160) || mosque.tagline || `Kenali barisan jawatankuasa yang menguruskan dan mengimarahkan ${mosque.name}.`,
    });
}

export default async function AjkPage({ params }: Props) {
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

    const { data: committee } = await supabase
        .from("committee_members")
        .select("*")
        .eq("mosque_id", mosque.id)
        .order("display_order", { ascending: true });

    // Generate Structured Data
    const jsonLd = generateAboutPageSchema(mosque, {
        name: `Senarai AJK ${mosque.name}`,
        path: "/ajk"
    });

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
                                Kepimpinan Masjid
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heading font-black text-gray-900 mb-6 tracking-tight">
                                Senarai AJK
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
                                Kenali barisan jawatankuasa yang menguruskan dan mengimarahkan <span className="font-bold text-gray-900">{mosque.name}</span>.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 py-20">
                    <AjkContent
                        mosque={mosque}
                        committee={committee || []}
                    />
                </div>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
