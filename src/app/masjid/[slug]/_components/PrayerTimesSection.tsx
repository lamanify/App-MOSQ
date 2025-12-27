"use client";

import { useState, useEffect, useMemo } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { getNextPrayer, type SimplePrayerTimes } from "@/lib/jakim";
import { getZoneByCode } from "@/lib/zones";
import { PrayerClock } from "./PrayerClock";

interface PrayerTimesSectionProps {
    prayerTimes: SimplePrayerTimes;
    mosqueZoneCode: string | null;
    brandColor: string;
}

export function PrayerTimesSection({ prayerTimes, mosqueZoneCode, brandColor }: PrayerTimesSectionProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Only update every minute for highlights
        return () => clearInterval(timer);
    }, []);

    const nextPrayer = useMemo(() => {
        if (!prayerTimes || !currentTime) return null;
        return getNextPrayer(prayerTimes)?.name || null;
    }, [prayerTimes, currentTime]);

    const getIqamahTime = (timeStr: string) => {
        try {
            const [h, m] = timeStr.split(':').map(Number);
            let newM = m + 10;
            let newH = h;
            if (newM >= 60) {
                newM -= 60;
                newH = (newH + 1) % 24;
            }
            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        } catch {
            return timeStr;
        }
    };

    const prayers = [
        { name: "Subuh", time: prayerTimes.subuh, icon: Sunrise },
        { name: "Syuruk", time: prayerTimes.syuruk, icon: Sun },
        { name: "Zohor", time: prayerTimes.zohor, icon: Sun },
        { name: "Asar", time: prayerTimes.asar, icon: Sun },
        { name: "Maghrib", time: prayerTimes.maghrib, icon: Sunset },
        { name: "Isyak", time: prayerTimes.isyak, icon: Moon },
    ];

    const currentZone = getZoneByCode(mosqueZoneCode || "");

    return (
        <section id="info" className="relative z-20 -mt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-brand/10 p-2 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {prayers.map((prayer) => {
                            const isNext = prayer.name === nextPrayer;

                            return (
                                <div
                                    key={prayer.name}
                                    className={`relative group p-6 rounded-[2rem] transition-all duration-300 overflow-hidden min-h-[160px] flex flex-col justify-between text-left ${isNext
                                        ? "bg-brand text-white scale-105 shadow-xl shadow-brand/20"
                                        : "bg-white border border-brand/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-start w-full mb-2">
                                        <p className={`text-sm font-bold uppercase tracking-wider ${isNext ? "text-emerald-100" : "text-gray-400"
                                            }`}>
                                            {prayer.name}
                                        </p>
                                        <div
                                            className={`p-2 rounded-xl transition-colors ${isNext ? "bg-white/20 text-white backdrop-blur-sm" : "bg-gray-50 text-gray-400 group-hover:bg-brand group-hover:text-white"}`}
                                        >
                                            <prayer.icon size={20} strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <p className={`text-4xl lg:text-5xl font-heading font-black tracking-tight ${isNext ? "text-white" : "text-gray-900"
                                            }`}>
                                            {prayer.time}
                                        </p>
                                    </div>

                                    <div className={`mt-4 pt-4 border-t flex items-center gap-2 ${isNext ? "border-white/20 text-blue-50" : "border-gray-100 text-gray-400"
                                        }`}>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isNext ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                            }`}>
                                            Iqamah
                                        </div>
                                        <p className="text-sm font-bold tabular-nums">
                                            {prayer.name === "Syuruk" ? "-" : getIqamahTime(prayer.time)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <PrayerClock
                        prayerTimes={prayerTimes}
                        zoneCode={mosqueZoneCode || undefined}
                        brandColor={brandColor}
                        hijriDate={prayerTimes.hijri}
                        state={currentZone?.state}
                    />
                </div>
            </div>
        </section>
    );
}
