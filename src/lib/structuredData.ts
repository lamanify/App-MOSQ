

/**
 * Structured Data (JSON-LD) generators for MOSQ tenant sites.
 * 
 * Core principle: One mosque = one authoritative entity.
 * All pages reference the same mosque @id for consistent entity linking.
 * 
 * Rules:
 * - JSON-LD only (no microdata/RDFa)
 * - No fake data (only include fields that have real values)
 * - All schemas reference the same mosque @id
 */

// ============================================================================
// TYPES
// ============================================================================

interface MosqueSchemaData {
    id: string;
    slug: string;
    name: string;
    address?: string | null;
    state?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    email?: string | null;
    google_maps_name?: string | null;
}

interface WebPageConfig {
    name: string;
    description: string;
    path?: string;
}

interface EventSchemaData {
    title: string;
    description?: string | null;
    event_date: string;
    event_time?: string | null;
    location?: string | null;
    speaker?: string | null;
    featured_image_url?: string | null;
    slug?: string | null;
    id: string;
}

interface ArticleSchemaData {
    title: string;
    content: string;
    created_at: string;
    slug?: string | null;
    id: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate the base URL for a tenant site.
 */
function getTenantBaseUrl(slug: string): string {
    return `https://${slug}.mosq.io`;
}

/**
 * Generate the canonical mosque @id for entity linking.
 * This ID should be reused across ALL pages to maintain entity consistency.
 */
function getMosqueId(slug: string): string {
    return `${getTenantBaseUrl(slug)}#mosque`;
}

// ============================================================================
// BASE MOSQUE SCHEMA (Required on ALL pages)
// ============================================================================

/**
 * Generate the base mosque schema using Place + LocalBusiness.
 * This establishes the mosque as the primary entity for the site.
 * 
 * Include on: Homepage, Tentang, Hubungi, Jadual Solat, Aktiviti, etc.
 */
export function generateMosqueSchema(mosque: MosqueSchemaData): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);
    const mosqueId = getMosqueId(mosque.slug);

    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": ["Place", "LocalBusiness"],
        "@id": mosqueId,
        "name": mosque.name,
        "url": baseUrl,
    };

    // Add address if available
    if (mosque.address || mosque.state) {
        schema.address = {
            "@type": "PostalAddress",
            ...(mosque.address && { streetAddress: mosque.address }),
            ...(mosque.state && { addressRegion: mosque.state }),
            "addressCountry": "MY",
        };
    }

    // Add contact info if available
    if (mosque.phone) {
        schema.telephone = mosque.phone;
    }
    if (mosque.email) {
        schema.email = mosque.email;
    }

    // Add geo coordinates if available
    if (mosque.latitude && mosque.longitude) {
        schema.geo = {
            "@type": "GeoCoordinates",
            "latitude": mosque.latitude,
            "longitude": mosque.longitude,
        };
    }

    // Add Google Maps link if name is available
    if (mosque.google_maps_name) {
        schema.sameAs = [
            `https://maps.google.com/?q=${encodeURIComponent(mosque.google_maps_name)}`,
        ];
    }

    return schema;
}

// ============================================================================
// PAGE-SPECIFIC SCHEMAS
// ============================================================================

/**
 * Generate WebPage schema for generic pages.
 * Use on: Homepage, Pengumuman list, Dana, etc.
 */
export function generateWebPageSchema(
    mosque: MosqueSchemaData,
    config: WebPageConfig
): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);
    const pageUrl = config.path ? `${baseUrl}${config.path}` : baseUrl;

    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": config.name,
        "description": config.description,
        "url": pageUrl,
        "about": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

/**
 * Generate WebSite schema for the homepage.
 * Only use on the main homepage to establish site identity.
 */
export function generateWebSiteSchema(mosque: MosqueSchemaData): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);

    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": mosque.name,
        "url": baseUrl,
        "about": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

/**
 * Generate AboutPage schema for Tentang/AJK pages.
 * Strengthens entity trust and legitimacy.
 */
export function generateAboutPageSchema(
    mosque: MosqueSchemaData,
    config: { name: string; path: string }
): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);

    return {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": config.name,
        "url": `${baseUrl}${config.path}`,
        "about": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

/**
 * Generate ContactPage schema for Hubungi pages.
 */
export function generateContactPageSchema(
    mosque: MosqueSchemaData,
    config: { name: string; path: string }
): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);

    return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": config.name,
        "url": `${baseUrl}${config.path}`,
        "about": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

/**
 * Generate EventSeries schema for aktiviti list page.
 * Use for recurring/weekly activities.
 */
export function generateEventSeriesSchema(
    mosque: MosqueSchemaData,
    config: { name: string; description: string }
): object {
    return {
        "@context": "https://schema.org",
        "@type": "EventSeries",
        "name": config.name,
        "description": config.description,
        "location": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

/**
 * Generate Event schema for individual aktiviti/program.
 */
export function generateEventSchema(
    event: EventSchemaData,
    mosque: MosqueSchemaData
): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);
    const eventUrl = `${baseUrl}/aktiviti/${event.slug || event.id}`;

    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.title,
        "url": eventUrl,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "startDate": event.event_date,
        "location": {
            "@id": getMosqueId(mosque.slug),
        },
        "organizer": {
            "@id": getMosqueId(mosque.slug),
        },
    };

    // Add optional fields
    if (event.description) {
        schema.description = event.description;
    }
    if (event.featured_image_url) {
        schema.image = event.featured_image_url;
    }
    if (event.speaker) {
        schema.performer = {
            "@type": "Person",
            "name": event.speaker,
        };
    }

    return schema;
}

/**
 * Generate Article schema for pengumuman/announcement detail.
 */
export function generateArticleSchema(
    article: ArticleSchemaData,
    mosque: MosqueSchemaData
): object {
    const baseUrl = getTenantBaseUrl(mosque.slug);
    const articleUrl = `${baseUrl}/pengumuman/${article.slug || article.id}`;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "url": articleUrl,
        "datePublished": article.created_at,
        "articleBody": article.content,
        "author": {
            "@id": getMosqueId(mosque.slug),
        },
        "publisher": {
            "@id": getMosqueId(mosque.slug),
        },
    };
}

// ============================================================================
// COMBINED SCHEMA HELPERS
// ============================================================================

/**
 * Combine multiple schemas into a single @graph array.
 * Use when a page needs to output multiple schema types.
 */
export function combineSchemas(...schemas: object[]): object {
    return {
        "@context": "https://schema.org",
        "@graph": schemas.map((schema) => {
            // Remove @context from individual schemas when combining
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { "@context": _context, ...rest } = schema as Record<string, unknown>;
            return rest;
        }),
    };
}
