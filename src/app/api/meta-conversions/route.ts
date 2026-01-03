import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const API_VERSION = "v21.0";

// Hash function for user data (required by Meta)
function hashData(data: string): string {
    return crypto
        .createHash("sha256")
        .update(data.toLowerCase().trim())
        .digest("hex");
}

interface EventData {
    event_name: "ViewContent" | "CompleteRegistration" | "Subscribe";
    event_id: string;
    event_source_url: string;
    user_data: {
        email?: string;
        fn?: string; // first name
        client_ip_address?: string;
        client_user_agent?: string;
        fbp?: string; // _fbp cookie
        fbc?: string; // _fbc cookie
        external_id?: string;
        country?: string;
        phone?: string;
        zp?: string; // zip/postal code
        db?: string; // date of birth (YYYYMMDD)
        ln?: string; // last name
        ct?: string; // city
        st?: string; // state/region
        ge?: string; // gender 'm' or 'f'
        fb_login_id?: string;
    };
    custom_data?: Record<string, unknown>;
    test_event_code?: string;
}

export async function POST(request: NextRequest) {
    try {
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.error("Meta Conversions API: Missing credentials");
            return NextResponse.json(
                { error: "Meta API not configured" },
                { status: 500 }
            );
        }

        const body: EventData = await request.json();
        const { event_name, event_id, event_source_url, user_data, custom_data, test_event_code } = body;

        // Validate required fields
        if (!event_name || !event_id) {
            return NextResponse.json(
                { error: "Missing required fields: event_name, event_id" },
                { status: 400 }
            );
        }

        // Get client IP from headers
        const clientIp =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // Get user agent from headers
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Prepare user data with hashing
        const hashedUserData: Record<string, string> = {};

        if (user_data.email) {
            hashedUserData.em = hashData(user_data.email);
        }
        if (user_data.fn) {
            hashedUserData.fn = hashData(user_data.fn);
        }
        if (user_data.external_id) {
            hashedUserData.external_id = hashData(user_data.external_id);
        }
        if (user_data.country) {
            hashedUserData.country = hashData(user_data.country);
        }
        if (user_data.phone) {
            // Remove all non-numeric characters for phone normalization
            const normalizedPhone = user_data.phone.replace(/\D/g, "");
            hashedUserData.ph = hashData(normalizedPhone);
        }
        if (user_data.zp) {
            hashedUserData.zp = hashData(user_data.zp);
        }
        if (user_data.db) {
            // DOB format should be YYYYMMDD
            hashedUserData.db = hashData(user_data.db.replace(/\D/g, ""));
        }
        if (user_data.ln) {
            hashedUserData.ln = hashData(user_data.ln);
        }
        if (user_data.ct) {
            hashedUserData.ct = hashData(user_data.ct);
        }
        if (user_data.st) {
            hashedUserData.st = hashData(user_data.st);
        }
        if (user_data.ge) {
            hashedUserData.ge = hashData(user_data.ge);
        }

        // Non-hashed fields
        if (clientIp !== "unknown") {
            hashedUserData.client_ip_address = clientIp;
        }
        hashedUserData.client_user_agent = userAgent;

        if (user_data.fbp) {
            hashedUserData.fbp = user_data.fbp;
        }
        if (user_data.fbc) {
            hashedUserData.fbc = user_data.fbc;
        }
        if (user_data.fb_login_id) {
            hashedUserData.fb_login_id = user_data.fb_login_id;
        }

        // Build event payload
        const eventPayload = {
            data: [
                {
                    event_name,
                    event_time: Math.floor(Date.now() / 1000),
                    event_id,
                    event_source_url: event_source_url || "https://app.mosq.io",
                    action_source: "website",
                    user_data: hashedUserData,
                    ...(custom_data && { custom_data }),
                },
            ],
            ...(test_event_code && { test_event_code }),
        };

        // Send to Meta Conversions API
        const response = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventPayload),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Meta Conversions API Error:", result);
            return NextResponse.json(
                { error: "Failed to send event", details: result },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            events_received: result.events_received,
            fbtrace_id: result.fbtrace_id,
        });
    } catch (error) {
        console.error("Meta Conversions API Exception:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
