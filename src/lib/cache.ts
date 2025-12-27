import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
    /** Short-lived cache for frequently changing data (3 minutes) */
    SHORT: 180,
    /** Medium cache for moderately changing data (10 minutes) */
    MEDIUM: 600,
    /** Long cache for stable content (1 hour) */
    LONG: 3600,
    /** Extended cache for rarely changing content (6 hours) */
    EXTENDED: 21600,
    /** Static cache for mostly static content (24 hours) */
    STATIC: 86400,
} as const;

/**
 * Cache revalidation tags for on-demand revalidation
 */
export const CACHE_TAGS = {
    mosque: (slug: string) => `mosque-${slug}`,
    mosqueData: (slug: string) => `mosque-data-${slug}`,
    announcements: (mosqueId: string) => `announcements-${mosqueId}`,
    events: (mosqueId: string) => `events-${mosqueId}`,
    committee: (mosqueId: string) => `committee-${mosqueId}`,
    prayerTimes: (zoneCode: string) => `prayer-times-${zoneCode}`,
    allMosques: "all-mosques",
} as const;

/**
 * Cached mosque data fetcher - core data used across all tenant pages
 * This is the primary cached function for mosque information
 */
export const getCachedMosqueBySlug = unstable_cache(
    async (slug: string) => {
        const supabase = await createStaticClient();
        const { data: mosque, error } = await supabase
            .from("mosques")
            .select("*")
            .eq("slug", slug)
            .eq("is_published", true)
            .single();

        if (error || !mosque) {
            return null;
        }

        return mosque;
    },
    ["mosque-by-slug"],
    {
        revalidate: CACHE_DURATION.MEDIUM,
        tags: ["mosques"],
    }
);

/**
 * Cached minimal mosque data for metadata generation
 * Uses smaller payload for faster metadata response
 */
export const getCachedMosqueMetadata = unstable_cache(
    async (slug: string) => {
        const supabase = await createStaticClient();
        const { data: mosque, error } = await supabase
            .from("mosques")
            .select("id, name, slug, tagline, about_text, logo_url, hero_image_url, brand_color")
            .eq("slug", slug)
            .eq("is_published", true)
            .single();

        if (error || !mosque) {
            return null;
        }

        return mosque;
    },
    ["mosque-metadata"],
    {
        revalidate: CACHE_DURATION.LONG,
        tags: ["mosques"],
    }
);

/**
 * Cached announcements fetcher
 */
export const getCachedAnnouncements = unstable_cache(
    async (mosqueId: string, limit?: number) => {
        const supabase = await createStaticClient();
        let query = supabase
            .from("announcements")
            .select("*")
            .eq("mosque_id", mosqueId)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data: announcements } = await query;
        return announcements || [];
    },
    ["announcements"],
    {
        revalidate: CACHE_DURATION.SHORT,
        tags: ["announcements"],
    }
);

/**
 * Cached events fetcher
 */
export const getCachedEvents = unstable_cache(
    async (mosqueId: string, limit?: number) => {
        const supabase = await createStaticClient();
        let query = supabase
            .from("events")
            .select("*")
            .eq("mosque_id", mosqueId)
            .eq("is_published", true)
            .order("event_date", { ascending: true });

        if (limit) {
            query = query.limit(limit);
        }

        const { data: events } = await query;
        return events || [];
    },
    ["events"],
    {
        revalidate: CACHE_DURATION.SHORT,
        tags: ["events"],
    }
);

/**
 * Cached committee members fetcher
 */
export const getCachedCommittee = unstable_cache(
    async (mosqueId: string) => {
        const supabase = await createStaticClient();
        const { data: committee } = await supabase
            .from("committee_members")
            .select("*")
            .eq("mosque_id", mosqueId)
            .order("display_order", { ascending: true });

        return committee || [];
    },
    ["committee"],
    {
        revalidate: CACHE_DURATION.LONG,
        tags: ["committee"],
    }
);

/**
 * Get all published mosque slugs for static generation
 */
export const getAllMosqueSlugs = unstable_cache(
    async () => {
        const supabase = await createStaticClient();
        const { data: mosques } = await supabase
            .from("mosques")
            .select("slug")
            .eq("is_published", true);

        return mosques?.map((m) => m.slug) || [];
    },
    ["all-mosque-slugs"],
    {
        revalidate: CACHE_DURATION.MEDIUM,
        tags: ["mosques"],
    }
);

/**
 * Cached individual announcement fetcher
 */
export const getCachedAnnouncementBySlug = unstable_cache(
    async (mosqueId: string, slugOrId: string) => {
        const supabase = await createStaticClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

        const { data: announcement } = await supabase
            .from("announcements")
            .select("*")
            .eq("mosque_id", mosqueId)
            .or(`slug.eq.${slugOrId}${isUuid ? `,id.eq.${slugOrId}` : ""}`)
            .single();

        return announcement;
    },
    ["announcement-by-slug"],
    {
        revalidate: CACHE_DURATION.SHORT,
        tags: ["announcements"],
    }
);

/**
 * Cached individual event fetcher
 */
export const getCachedEventBySlug = unstable_cache(
    async (mosqueId: string, slugOrId: string) => {
        const supabase = await createStaticClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

        const { data: event } = await supabase
            .from("events")
            .select("*")
            .eq("mosque_id", mosqueId)
            .or(`slug.eq.${slugOrId}${isUuid ? `,id.eq.${slugOrId}` : ""}`)
            .single();

        return event;
    },
    ["event-by-slug"],
    {
        revalidate: CACHE_DURATION.SHORT,
        tags: ["events"],
    }
);
