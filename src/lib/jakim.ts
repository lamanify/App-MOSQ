// JAKIM e-Solat API Integration
// API: https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat

export interface PrayerTime {
    hijri: string;
    date: string;
    day: string;
    imsak: string;
    fajr: string;      // Subuh
    syuruk: string;    // Syuruk
    dhuhr: string;     // Zohor
    asr: string;       // Asar
    maghrib: string;   // Maghrib
    isha: string;      // Isyak
}

export interface PrayerTimesResponse {
    prayerTime: PrayerTime[];  // Note: API returns 'prayerTime' not 'ppirayerTime'
    status: string;
    serverTime: string;
    periodType: string;
    lang: string;
    zone: string;
    bearing: string;
}

// Display-friendly prayer time names in Malay
export const PRAYER_NAMES = {
    imsak: "Imsak",
    fajr: "Subuh",
    syuruk: "Syuruk",
    dhuhr: "Zohor",
    asr: "Asar",
    maghrib: "Maghrib",
    isha: "Isyak",
} as const;

export type PrayerName = keyof typeof PRAYER_NAMES;

export interface SimplePrayerTimes {
    subuh: string;
    syuruk: string;
    zohor: string;
    asar: string;
    maghrib: string;
    isyak: string;
    date: string;
    hijri: string;
}

export async function fetchPrayerTimes(zoneCode: string): Promise<SimplePrayerTimes | null> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    const sanitizedZone = zoneCode.trim().toUpperCase();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Create an AbortController for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const apiUrl = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${sanitizedZone}`;

            const response = await fetch(
                apiUrl,
                {
                    // Cache for 1 hour
                    next: { revalidate: 3600 },
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`JAKIM API error: ${response.status}`);
            }

            const data: PrayerTimesResponse = await response.json();

            if (data.status !== "OK!" || !data.prayerTime || data.prayerTime.length === 0) {
                console.error("JAKIM API returned invalid data:", data);
                throw new Error("Invalid response from JAKIM API");
            }

            const today = data.prayerTime[0];

            return {
                subuh: formatTime(today.fajr),
                syuruk: formatTime(today.syuruk),
                zohor: formatTime(today.dhuhr),
                asar: formatTime(today.asr),
                maghrib: formatTime(today.maghrib),
                isyak: formatTime(today.isha),
                date: today.date,
                hijri: today.hijri,
            };
        } catch (error) {
            lastError = error as Error;
            console.error(`Error fetching prayer times (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

            // If it's the last attempt, break
            if (attempt >= maxRetries) break;

            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        }
    }

    console.error("All attempts to fetch prayer times failed:", lastError);
    return null;
}

// Format time from "HH:MM:SS" to "HH:MM" or handle "HH:MM"
function formatTime(time: string): string {
    if (!time) return "--:--";
    const parts = time.split(":");
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
}

// Get the next prayer based on current time
export function getNextPrayer(prayerTimes: SimplePrayerTimes): { name: string; time: string } | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
        { name: "Subuh", time: prayerTimes.subuh },
        { name: "Syuruk", time: prayerTimes.syuruk },
        { name: "Zohor", time: prayerTimes.zohor },
        { name: "Asar", time: prayerTimes.asar },
        { name: "Maghrib", time: prayerTimes.maghrib },
        { name: "Isyak", time: prayerTimes.isyak },
    ];

    for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const prayerMinutes = hours * 60 + minutes;
        if (prayerMinutes > currentTime) {
            return prayer;
        }
    }

    // If all prayers have passed, next prayer is tomorrow's Subuh
    return { name: "Subuh", time: prayerTimes.subuh };
}
