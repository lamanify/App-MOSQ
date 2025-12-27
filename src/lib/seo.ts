import type { Metadata } from "next";

// Default MOSQ branding for SEO fallbacks
const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/debi0yfq9/image/upload/v1766797543/APP_MOSQ_-_Image_slioua.jpg";

interface TenantMetadataProps {
    mosque: {
        name: string;
        tagline?: string | null;
        about_text?: string | null;
        logo_url?: string | null;
        hero_image_url?: string | null;
    };
    slug: string;
    path?: string;
    title: string;
    description?: string;
    image?: string | null;
    type?: "website" | "article";
}

/**
 * Helper to construct SEO metadata for tenant pages with subdomain-aware routing.
 * Automatically handles:
 * - Subdomain URL construction (e.g., https://slug.mosq.io)
 * - MetadataBase setting
 * - Canonical URL generation
 * - Open Graph & Twitter Card defaults
 * - Fallback to default MOSQ branding if mosque images are missing
 */
export function constructTenantMetadata({
    mosque,
    slug,
    path = "",
    title,
    description,
    image,
    type = "website",
}: TenantMetadataProps): Metadata {
    const baseUrl = `https://${slug}.mosq.io`;
    const pageUrl = `${baseUrl}${path}`;

    // Determine the description to use
    // 1. Explicit description (e.g. from event/announcement)
    // 2. Mosque tagline 
    // 3. Mosque about text (truncated)
    // 4. Default fallback
    const finalDescription = description ||
        mosque.tagline ||
        mosque.about_text?.slice(0, 160) ||
        `Laman web rasmi ${mosque.name}`;

    // Determine the image to use
    // 1. Explicit image (e.g. from event/announcement)
    // 2. Mosque hero image
    // 3. Mosque logo
    // 4. Default MOSQ branding
    const imageUrl = image || mosque.hero_image_url || mosque.logo_url || DEFAULT_OG_IMAGE;

    return {
        title,
        description: finalDescription,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title,
            description: finalDescription,
            url: pageUrl,
            type,
            siteName: "MOSQ",
            images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: finalDescription,
            images: [imageUrl],
        },
    };
}
