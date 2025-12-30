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

// Get Meta cookies from browser
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

    return {
        fbp: cookies["_fbp"],
        fbc: cookies["_fbc"],
    };
}

// Get current page URL
function getCurrentUrl(): string {
    if (typeof window === "undefined") return "https://app.mosq.io";
    return window.location.href;
}

interface UserData {
    email?: string;
    firstName?: string;
    externalId?: string;
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
                    external_id: userData.externalId,
                    country: "my", // Malaysia
                    ...cookies,
                },
                custom_data: customData,
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
 * Track when user views the registration/signup page
 */
export async function trackViewContent(): Promise<void> {
    await trackEvent({
        eventName: "ViewContent",
        customData: {
            content_name: "Signup Page",
            content_category: "Registration",
        },
    });
}

/**
 * Track when user successfully registers
 */
export async function trackCompleteRegistration(userData: {
    email: string;
    firstName?: string;
    userId?: string;
}): Promise<void> {
    await trackEvent({
        eventName: "CompleteRegistration",
        userData: {
            email: userData.email,
            firstName: userData.firstName,
            externalId: userData.userId,
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
    userId?: string;
    mosqueName?: string;
}): Promise<void> {
    await trackEvent({
        eventName: "Subscribe",
        userData: {
            email: userData.email,
            firstName: userData.firstName,
            externalId: userData.userId,
        },
        customData: {
            subscription_type: "mosque_published",
            mosque_name: userData.mosqueName,
        },
    });
}
