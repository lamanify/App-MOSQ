import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to build tenant subdomain URL
function getTenantUrl(slug: string, path: string = ''): string {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mosq.io';
    const protocol = baseDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${slug}.${baseDomain}${path}`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
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
        return new NextResponse('Mosque not found', { status: 404 });
    }

    const lastMod = mosque.updated_at ? new Date(mosque.updated_at).toISOString() : new Date().toISOString();

    // Static Pages for this Tenant
    const staticPaths = [
        { path: '', changeFrequency: 'daily', priority: 1.0 },
        { path: '/pengumuman', changeFrequency: 'daily', priority: 0.8 },
        { path: '/aktiviti', changeFrequency: 'daily', priority: 0.8 },
        { path: '/ajk', changeFrequency: 'monthly', priority: 0.6 },
        { path: '/dana', changeFrequency: 'monthly', priority: 0.7 },
        { path: '/hubungi-kami', changeFrequency: 'monthly', priority: 0.6 },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPaths.forEach(({ path, changeFrequency, priority }) => {
        xml += `
  <url>
    <loc>${getTenantUrl(slug, path)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    // Fetch Active Announcements
    const { data: announcements } = await supabase
        .from('announcements')
        .select('slug, created_at')
        .eq('mosque_id', mosque.id)
        .eq('is_active', true)
        .not('slug', 'is', null);

    if (announcements) {
        announcements.forEach((announcement) => {
            if (announcement.slug) {
                const date = announcement.created_at ? new Date(announcement.created_at).toISOString() : lastMod;
                xml += `
  <url>
    <loc>${getTenantUrl(slug, `/pengumuman/${announcement.slug}`)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            }
        });
    }

    // Fetch Published Events
    const { data: events } = await supabase
        .from('events')
        .select('slug, created_at')
        .eq('mosque_id', mosque.id)
        .eq('is_published', true)
        .not('slug', 'is', null);

    if (events) {
        events.forEach((event) => {
            if (event.slug) {
                const date = event.created_at ? new Date(event.created_at).toISOString() : lastMod;
                xml += `
  <url>
    <loc>${getTenantUrl(slug, `/aktiviti/${event.slug}`)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            }
        });
    }

    xml += `
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
    });
}
