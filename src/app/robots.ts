import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.mosq.io';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/login',
                    '/signup',
                    '/onboarding',
                    '/api/*',
                    '/_next/*',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
