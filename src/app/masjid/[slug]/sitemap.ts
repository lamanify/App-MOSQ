import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to build tenant subdomain URL
function getTenantUrl(slug: string, path: string = ''): string {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mosq.io';
    const protocol = baseDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${slug}.${baseDomain}${path}`;
}

export default async function sitemap({ params }: { params: Promise<{ slug: string }> }): Promise<MetadataRoute.Sitemap> {
    const slug = (await params).slug;
    const supabase = createAdminClient();

    // Fetch mosque details
    const { data: mosque, error: mosqueError } = await supabase
        .from('mosques')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (mosqueError || !mosque) {
        return [];
    }

    const lastMod = mosque.updated_at ? new Date(mosque.updated_at) : new Date();
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // 1. Static Pages for this Tenant
    const staticPaths = [
        { path: '', changeFrequency: 'daily', priority: 1.0 },
        { path: '/pengumuman', changeFrequency: 'daily', priority: 0.8 },
        { path: '/aktiviti', changeFrequency: 'daily', priority: 0.8 },
        { path: '/ajk', changeFrequency: 'monthly', priority: 0.6 },
        { path: '/dana', changeFrequency: 'monthly', priority: 0.7 },
        { path: '/hubungi-kami', changeFrequency: 'monthly', priority: 0.6 },
    ] as const;

    staticPaths.forEach(({ path, changeFrequency, priority }) => {
        sitemapEntries.push({
            url: getTenantUrl(slug, path),
            lastModified: lastMod,
            changeFrequency,
            priority,
        });
    });

    // 2. Fetch Active Announcements
    const { data: announcements } = await supabase
        .from('announcements')
        .select('slug, created_at')
        .eq('mosque_id', mosque.id)
        .eq('is_active', true)
        .not('slug', 'is', null);

    if (announcements) {
        announcements.forEach((announcement) => {
            if (announcement.slug) {
                sitemapEntries.push({
                    url: getTenantUrl(slug, `/pengumuman/${announcement.slug}`),
                    lastModified: announcement.created_at ? new Date(announcement.created_at) : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        });
    }

    // 3. Fetch Published Events
    const { data: events } = await supabase
        .from('events')
        .select('slug, created_at')
        .eq('mosque_id', mosque.id)
        .eq('is_published', true)
        .not('slug', 'is', null);

    if (events) {
        events.forEach((event) => {
            if (event.slug) {
                sitemapEntries.push({
                    url: getTenantUrl(slug, `/aktiviti/${event.slug}`),
                    lastModified: event.created_at ? new Date(event.created_at) : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            }
        });
    }

    return sitemapEntries;
}
