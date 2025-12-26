import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMosquePage } from "./PublicMosquePage";

interface Props {
    params: Promise<{ slug: string }>;
}

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

    const title = `${mosque.name} | MOSQ`;
    const description = mosque.tagline || mosque.about_text?.slice(0, 160) || `Laman web rasmi ${mosque.name}`;
    const imageUrl = mosque.hero_image_url || mosque.logo_url;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            siteName: "MOSQ",
            images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    };
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
        // @ts-ignore - Dynamic import to avoid circular dependency if any, but standard import should work
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

    return (
        <PublicMosquePage
            mosque={mosque}
            announcements={announcements || []}
            events={events || []}
            committee={committee || []}
            initialPrayerTimes={prayerTimes}
        />
    );
}
