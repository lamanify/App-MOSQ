import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMosquePage } from "./PublicMosquePage";
import { StructuredData } from "@/components/StructuredData";
import { generateWebPageSchema, generateWebSiteSchema, combineSchemas } from "@/lib/structuredData";

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
        title: `${mosque.name} | MOSQ`,
    });
}


export default async function MosquePage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch mosque
    const { data: mosque } = await supabase
        .from("mosques")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!mosque) {
        notFound();
    }

    // Fetch related data
    const [
        { data: announcements },
        { data: events },
        { data: committee },
        // Dynamic import to avoid circular dependency if any, but standard import should work
        prayerTimes
    ] = await Promise.all([
        supabase
            .from("announcements")
            .select("*")
            .eq("mosque_id", mosque.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(5),
        supabase
            .from("events")
            .select("*")
            .eq("mosque_id", mosque.id)
            .eq("is_published", true)
            .order("event_date", { ascending: true })
            .limit(6),
        supabase
            .from("committee_members")
            .select("*")
            .eq("mosque_id", mosque.id)
            .order("display_order", { ascending: true }),
        // Fetch prayer times if zone code exists
        mosque.zone_code ? import("@/lib/jakim").then(m => m.fetchPrayerTimes(mosque.zone_code!)) : Promise.resolve(null)
    ]);

    // Generate Structured Data (WebSite + WebPage)
    const webSiteSchema = generateWebSiteSchema(mosque);
    const webPageSchema = generateWebPageSchema(mosque, {
        name: mosque.name, // Use mosque name directly
        description: `Maklumat rasmi ${mosque.name} termasuk jadual solat, aktiviti dan cara hubungi.`,
        path: ""
    });

    const jsonLd = combineSchemas(webSiteSchema, webPageSchema);

    return (
        <>
            <StructuredData data={jsonLd} />
            <PublicMosquePage
                mosque={mosque}
                announcements={announcements || []}
                events={events || []}
                committee={committee || []}
                initialPrayerTimes={prayerTimes}
            />
        </>
    );
}
