"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { getNextPrayer, type SimplePrayerTimes } from "@/lib/jakim";

interface PrayerClockProps {
    prayerTimes: SimplePrayerTimes;
    zoneCode?: string;
    brandColor?: string;
    hijriDate?: string;
    state?: string;
}

export function PrayerClock({ prayerTimes, zoneCode, brandColor = "#4F46E5", hijriDate, state }: PrayerClockProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    // Derived nextPrayer
    const nextPrayer = useMemo(() => {
        if (!prayerTimes || !currentTime) return null;
        return getNextPrayer(prayerTimes)?.name || null;
    }, [prayerTimes, currentTime]);

    useEffect(() => {
        // Set initial time after mount to avoid hydration mismatch
        setCurrentTime(new Date());

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    if (!currentTime) return (
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-gray-50/80 rounded-[2rem] mt-2 gap-4 h-20 animate-pulse">
            <div className="w-48 h-6 bg-gray-200 rounded" />
            <div className="w-32 h-4 bg-gray-100 rounded" />
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-gray-50/80 rounded-[2rem] mt-2 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-brand/5 rounded-xl border border-brand/10">
                    <Clock size={16} className="animate-pulse text-brand" />
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                            {currentTime.toLocaleTimeString("ms-MY", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true
                            })}
                        </span>
                        <span className="hidden md:block w-px h-3 bg-gray-200" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {currentTime.toLocaleDateString("ms-MY", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Zon {zoneCode}, {state} • {hijriDate}
                    </p>
                </div>
            </div>
            <p className="text-xs font-medium text-gray-400">
                Sumber: e-Solat JAKIM
            </p>
        </div>
    );
}

// We also need a way to pass 'nextPrayer' to the individual cards if we want highlights.
// But the cards themselves are inside PublicMosquePage.
// To keep PublicMosquePage as a server component, the cards should also be server components.
// The "isNext" highlight can be a client component wrapper or we can use a small client-side script/component to apply the class.
