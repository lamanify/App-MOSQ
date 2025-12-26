import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    // First, update the session for auth
    const response = await updateSession(request);

    // Subdomain routing logic
    const url = request.nextUrl;
    const hostname = request.headers.get("host") || "";

    // Define the main domains to exclude from rewriting
    // lvh.me:3000 is included for local subdomain testing (resolves to 127.0.0.1)
    const mainDomains = ["mosq.io", "localhost:3000", "lvh.me:3000", "www.mosq.io", "app.mosq.io"];

    // Check if the current hostname is one of our main domains
    const isMainDomain = mainDomains.includes(hostname);

    // If not on main domain, it's a potential tenant subdomain
    if (!isMainDomain) {
        // Extract the subdomain (tenant slug)
        // masjid-lamanify.localhost:3000 -> subdomain is "masjid-lamanify"
        const subdomain = hostname.split('.')[0];

        // Skip for www or empty
        if (subdomain !== 'www' && subdomain !== '') {
            // Internal paths to skip rewriting (auth, admin, api)
            const internalPaths = ["/admin", "/login", "/signup", "/api", "/_next", "/favicon.ico"];
            const isInternalPath = internalPaths.some(path => url.pathname.startsWith(path));

            if (!isInternalPath && !url.pathname.startsWith("/masjid")) {
                const searchParams = url.searchParams.toString();
                const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

                // Rewrite to the tenant's specific page
                return NextResponse.rewrite(
                    new URL(`/masjid/${subdomain}${path}`, request.url)
                );
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
