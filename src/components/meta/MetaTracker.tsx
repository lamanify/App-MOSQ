"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-conversions";

interface MetaTrackerProps {
    eventName?: "ViewContent";
    userData?: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        userId?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        fbLoginId?: string;
    };
    contentName?: string;
    contentType?: string;
}

export function MetaTracker({
    eventName = "ViewContent",
    userData,
    contentName,
    contentType = "product"
}: MetaTrackerProps) {
    useEffect(() => {
        if (eventName === "ViewContent") {
            trackViewContent({
                ...userData,
            });
        }
    }, [eventName, userData, contentName, contentType]);

    return null;
}
