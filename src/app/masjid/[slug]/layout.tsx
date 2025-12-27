import type { Metadata, Viewport } from "next";
import { generateMosqueSchema } from "@/lib/structuredData";
import { StructuredData } from "@/components/StructuredData";
import { getCachedMosqueBySlug } from "@/lib/cache";

// Default MOSQ branding for SEO
const DEFAULT_FAVICON = "https://res.cloudinary.com/debi0yfq9/image/upload/v1766797441/Mosq_Logo_2_tv21jw.jpg";
const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/debi0yfq9/image/upload/v1766797543/APP_MOSQ_-_Image_slioua.jpg";

export const metadata: Metadata = {
    // Default icons for all tenant pages
    icons: {
        icon: [
            { url: DEFAULT_FAVICON, type: "image/jpeg" },
        ],
        shortcut: DEFAULT_FAVICON,
        apple: DEFAULT_FAVICON,
    },
    // Default Open Graph for all tenant pages (will be overridden by pages with their own metadata)
    openGraph: {
        type: "website",
        siteName: "MOSQ",
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: "MOSQ - Platform Laman Web Masjid",
            },
        ],
    },
    // Default Twitter card
    twitter: {
        card: "summary_large_image",
        images: [DEFAULT_OG_IMAGE],
    },
    // Additional SEO metadata
    applicationName: "MOSQ",
    generator: "MOSQ Platform",
    referrer: "origin-when-cross-origin",
    authors: [{ name: "MOSQ" }],
    creator: "MOSQ",
    publisher: "MOSQ",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    // metadataBase is set dynamically by each page based on the tenant slug
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Use cached mosque data instead of direct Supabase query
    const mosque = await getCachedMosqueBySlug(slug);

    if (!mosque) {
        return <>{children}</>;
    }

    const jsonLd = generateMosqueSchema(mosque);

    return (
        <>
            <StructuredData data={jsonLd} />
            {children}
        </>
    );
}
