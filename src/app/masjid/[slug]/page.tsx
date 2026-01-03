import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMosquePage } from "./PublicMosquePage";
import { StructuredData } from "@/components/StructuredData";
import { generateWebPageSchema, generateWebSiteSchema, combineSchemas } from "@/lib/structuredData";
import { constructTenantMetadata } from "@/lib/seo";
import { MetaTracker } from "@/components/meta/MetaTracker";
import {
    getCachedMosqueBySlug,
    getCachedMosqueMetadata,
    getCachedAnnouncements,
    getCachedEvents,
    getCachedCommittee,
    getAllMosqueSlugs,
} from "@/lib/cache";
import { fetchPrayerTimes } from "@/lib/jakim";

interface Props {
    params: Promise<{ slug: string }>;
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

// Generate static params for all published mosques
export async function generateStaticParams() {
    const slugs = await getAllMosqueSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // Use cached metadata query (smaller payload, longer cache)
    const mosque = await getCachedMosqueMetadata(slug);

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

    // Use cached mosque data
    const mosque = await getCachedMosqueBySlug(slug);

    if (!mosque) {
        notFound();
    }

    // Fetch all related data in parallel using cached functions
    const [announcements, events, committee, prayerTimes] = await Promise.all([
        getCachedAnnouncements(mosque.id, 5),
        getCachedEvents(mosque.id, 6),
        getCachedCommittee(mosque.id),
        // Prayer times have their own caching in fetchPrayerTimes
        mosque.zone_code ? fetchPrayerTimes(mosque.zone_code) : Promise.resolve(null),
    ]);

    // Generate Structured Data (WebSite + WebPage)
    const webSiteSchema = generateWebSiteSchema(mosque);
    const webPageSchema = generateWebPageSchema(mosque, {
        name: mosque.name,
        description: `Maklumat rasmi ${mosque.name} termasuk jadual solat, aktiviti dan cara hubungi.`,
        path: ""
    });

    const jsonLd = combineSchemas(webSiteSchema, webPageSchema);

    return (
        <>
            <StructuredData data={jsonLd} />
            <MetaTracker
                contentName={mosque.name}
                userData={{
                    city: mosque.state, // Using state as city for broader tracking if address is complex
                    state: mosque.state,
                    country: "my",
                }}
            />
            <PublicMosquePage
                mosque={mosque}
                announcements={announcements}
                events={events}
                committee={committee}
                initialPrayerTimes={prayerTimes}
            />
        </>
    );
}
