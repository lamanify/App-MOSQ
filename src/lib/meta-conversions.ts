/**
 * Meta Conversions API Client-side Utility
 * 
 * Tracks events and sends them to our server-side API route
 * which forwards them to Meta's Conversions API.
 */

// Generate a unique event ID for deduplication
export function generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get Meta cookies or URL parameters from browser
function getMetaCookies(): { fbp?: string; fbc?: string } {
    if (typeof document === "undefined") return {};

    const cookies = document.cookie.split(";").reduce(
        (acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
        },
        {} as Record<string, string>
    );

    let fbp = cookies["_fbp"];
    let fbc = cookies["_fbc"];

    // If fbc cookie is missing, try to get fbclid from URL
    if (!fbc && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const fbclid = urlParams.get("fbclid");
        if (fbclid) {
            // Format: fb.1.{timestamp}.{fbclid}
            fbc = `fb.1.${Date.now()}.${fbclid}`;
        }
    }

    return { fbp, fbc };
}

// Get current page URL
function getCurrentUrl(): string {
    if (typeof window === "undefined") return "https://app.mosq.io";
    return window.location.href;
}

// Get test event code from URL or localStorage
function getTestEventCode(): string | undefined {
    if (typeof window === "undefined") return undefined;

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("test_event_code");

    if (codeFromUrl) {
        // Save to localStorage for subsequent events/pages
        localStorage.setItem("META_TEST_EVENT_CODE", codeFromUrl);
        return codeFromUrl;
    }

    // Fallback to localStorage
    return localStorage.getItem("META_TEST_EVENT_CODE") || undefined;
}

interface UserData {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    externalId?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    gender?: "m" | "f"; // Meta expects 'm' or 'f'
    dateOfBirth?: string; // YYYYMMDD
    fbLoginId?: string;
}

interface TrackEventOptions {
    eventName: "ViewContent" | "CompleteRegistration" | "Subscribe";
    userData?: UserData;
    customData?: Record<string, unknown>;
}

async function trackEvent(options: TrackEventOptions): Promise<void> {
    const { eventName, userData = {}, customData } = options;
    const eventId = generateEventId();
    const cookies = getMetaCookies();
    const testEventCode = getTestEventCode();

    try {
        const response = await fetch("/api/meta-conversions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_name: eventName,
                event_id: eventId,
                event_source_url: getCurrentUrl(),
                user_data: {
                    email: userData.email,
                    fn: userData.firstName,
                    ln: userData.lastName,
                    phone: userData.phone,
                    external_id: userData.externalId,
                    ct: userData.city,
                    st: userData.state,
                    zp: userData.zip,
                    db: userData.dateOfBirth,
                    fb_login_id: userData.fbLoginId,
                    country: userData.country || "my", // Default to Malaysia
                    ge: userData.gender,
                    ...cookies,
                },
                custom_data: customData,
                test_event_code: testEventCode,
            }),
        });

        if (!response.ok) {
            console.error(`Meta tracking failed for ${eventName}:`, await response.text());
        }
    } catch (error) {
        // Silent fail - don't break user experience for tracking errors
        console.error(`Meta tracking error for ${eventName}:`, error);
    }
}

/**
 * Track when user views the registration/signup page (or any content)
 */
export async function trackViewContent(userData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    userId?: string;
    city?: string;
    state?: string;
    zip?: string;
    dateOfBirth?: string;
    fbLoginId?: string;
}): Promise<void> {
    await trackEvent({
        eventName: "ViewContent",
        userData: userData ? {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            externalId: userData.userId,
            city: userData.city,
            state: userData.state,
            zip: userData.zip,
            dateOfBirth: userData.dateOfBirth,
            fbLoginId: userData.fbLoginId,
        } : undefined,
        customData: {
            content_name: "Page View", // Generic default
        },
    });
}

/**
 * Track when user successfully registers
 */
export async function trackCompleteRegistration(userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    userId?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    fbLoginId?: string;
}): Promise<void> {
    await trackEvent({
        eventName: "CompleteRegistration",
        userData: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            externalId: userData.userId,
            city: userData.city,
            state: userData.state,
            zip: userData.zip,
            country: userData.country,
            fbLoginId: userData.fbLoginId,
        },
        customData: {
            status: "success",
        },
    });
}

/**
 * Track when user completes onboarding (publishes their mosque)
 */
export async function trackSubscribe(userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    userId?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    gender?: "m" | "f";
    dateOfBirth?: string;
    mosqueName?: string;
    fbLoginId?: string;
}): Promise<void> {
    await trackEvent({
        eventName: "Subscribe",
        userData: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            externalId: userData.userId,
            city: userData.city,
            state: userData.state,
            zip: userData.zip,
            country: userData.country,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            fbLoginId: userData.fbLoginId,
        },
        customData: {
            subscription_type: "mosque_published",
            mosque_name: userData.mosqueName,
        },
    });
}
