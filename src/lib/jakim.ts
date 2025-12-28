// JAKIM e-Solat API Integration
// API: https://api.waktusolat.app (Drop-in replacement for JAKIM)

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
    prayerTime: PrayerTime[];
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
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
            `https://api.waktusolat.app/solat/${zoneCode}`,
            {
                // Cache for 6 hours
                next: { revalidate: 21600 },
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Prayer Times API error: ${response.status}`);
        }

        const data: PrayerTimesResponse = await response.json();

        if (data.status !== "OK!" || !data.prayerTime || data.prayerTime.length === 0) {
            console.error("Prayer Times API returned invalid data:", data);
            throw new Error("Invalid response from Prayer Times API");
        }

        // The API returns the whole month. Find today's date in Malaysia timezone.
        const todayDate = getMalaysiaDate();
        const today = data.prayerTime.find(p => p.date === todayDate);

        if (!today) {
             console.error(`Prayer times for date ${todayDate} not found in response`);
             // Fallback to the first entry if today is not found (though unlikely if API works correctly)
             // or maybe the API returns next month?
             // Better to return null than wrong data?
             // But let's try to match by day if date format mismatch?
             // Assuming strict match first.
             return null;
        }

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
        console.error("Error fetching prayer times:", error);
        return null;
    }
}

function getMalaysiaDate(): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // en-GB format: "27 Dec 2025"
    // API format: "27-Dec-2025"
    const parts = formatter.formatToParts(new Date());
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;

    return `${day}-${month}-${year}`;
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
    // Convert to Malaysia time for comparison
    const malaysiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const currentTime = malaysiaTime.getHours() * 60 + malaysiaTime.getMinutes();

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
