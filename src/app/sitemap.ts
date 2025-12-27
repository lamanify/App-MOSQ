import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to build tenant subdomain URL
function getTenantUrl(slug: string, path: string = ''): string {
    // Tenant mosques use mosq.io (e.g., masjid-lamanify.mosq.io)
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mosq.io';
    const protocol = baseDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${slug}.${baseDomain}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Main app site is app.mosq.io
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.mosq.io';
    const supabase = createAdminClient();

    // Static pages for the main site
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    try {
        // Fetch all published mosques
        const { data: mosques, error: mosquesError } = await supabase
            .from('mosques')
            .select('slug, updated_at')
            .eq('is_published', true);

        if (mosquesError) {
            console.error('Error fetching mosques for sitemap:', mosquesError);
            return staticPages;
        }

        // Generate sitemap entries for each mosque using subdomain URLs
        const mosquePages: MetadataRoute.Sitemap = [];

        for (const mosque of mosques || []) {
            const lastMod = mosque.updated_at ? new Date(mosque.updated_at) : new Date();

            // Main mosque page (e.g., https://masjid-lamanify.mosq.io)
            mosquePages.push({
                url: getTenantUrl(mosque.slug),
                lastModified: lastMod,
                changeFrequency: 'weekly',
                priority: 0.9,
            });

            // Pengumuman (Announcements) page
            mosquePages.push({
                url: getTenantUrl(mosque.slug, '/pengumuman'),
                lastModified: lastMod,
                changeFrequency: 'daily',
                priority: 0.8,
            });

            // Aktiviti (Activities/Events) page
            mosquePages.push({
                url: getTenantUrl(mosque.slug, '/aktiviti'),
                lastModified: lastMod,
                changeFrequency: 'daily',
                priority: 0.8,
            });

            // AJK (Committee) page
            mosquePages.push({
                url: getTenantUrl(mosque.slug, '/ajk'),
                lastModified: lastMod,
                changeFrequency: 'monthly',
                priority: 0.6,
            });

            // Dana (Donations) page
            mosquePages.push({
                url: getTenantUrl(mosque.slug, '/dana'),
                lastModified: lastMod,
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        }

        // Fetch individual announcements with slugs
        const { data: announcements, error: announcementsError } = await supabase
            .from('announcements')
            .select('slug, mosque_id, created_at, mosques!inner(slug, is_published)')
            .eq('is_active', true)
            .not('slug', 'is', null);

        if (!announcementsError && announcements) {
            for (const announcement of announcements) {
                const mosqueSlugs = announcement.mosques as unknown as { slug: string; is_published: boolean };
                if (mosqueSlugs?.is_published && announcement.slug) {
                    mosquePages.push({
                        url: getTenantUrl(mosqueSlugs.slug, `/pengumuman/${announcement.slug}`),
                        lastModified: announcement.created_at ? new Date(announcement.created_at) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                }
            }
        }

        // Fetch individual events with slugs
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('slug, mosque_id, created_at, mosques!inner(slug, is_published)')
            .eq('is_published', true)
            .not('slug', 'is', null);

        if (!eventsError && events) {
            for (const event of events) {
                const mosqueSlugs = event.mosques as unknown as { slug: string; is_published: boolean };
                if (mosqueSlugs?.is_published && event.slug) {
                    mosquePages.push({
                        url: getTenantUrl(mosqueSlugs.slug, `/aktiviti/${event.slug}`),
                        lastModified: event.created_at ? new Date(event.created_at) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                }
            }
        }

        return [...staticPages, ...mosquePages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
