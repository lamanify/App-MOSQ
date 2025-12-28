"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { STATES, getZonesByState, type Zone } from "@/lib/zones";
import { Check, ChevronLeft, ChevronRight, Loader2, Shuffle } from "lucide-react";
import { resolveGoogleMapsLink } from "@/app/actions/google-maps";

// Predefined taglines for randomization
const TAGLINE_OPTIONS = [
    "Sentiasa berkhidmat untuk ummah setempat.",
    "Pusat ibadah dan komuniti masyarakat.",
    "Bersama membina komuniti berteraskan nilai Islam.",
    "Masjid untuk ibadah, ilmu dan kebajikan.",
    "Menyatukan jemaah melalui ibadah dan ilmu.",
    "Ruang ibadah dan aktiviti komuniti setempat.",
    "Mendekatkan masyarakat melalui peranan masjid.",
    "Masjid sebagai nadi komuniti setempat.",
    "Berperanan sebagai pusat ibadah dan kemasyarakatan.",
    "Ibadah, ilmu dan khidmat untuk masyarakat.",
];

// Predefined about text for randomization
const ABOUT_TEXT_OPTIONS = [
    "Masjid ini berperanan sebagai pusat ibadah bagi penduduk setempat serta menjadi tempat penyampaian ilmu dan aktiviti kemasyarakatan. Pelbagai program dijalankan untuk mengimarahkan masjid dan mengeratkan hubungan jemaah.",
    "Sebagai sebuah masjid komuniti, masjid ini menyediakan ruang untuk ibadah harian, program keagamaan dan aktiviti kemasyarakatan yang terbuka kepada semua lapisan masyarakat.",
    "Masjid ini berfungsi sebagai pusat ibadah serta platform untuk aktiviti keagamaan dan sosial yang bertujuan memperkukuh hubungan sesama masyarakat setempat.",
    "Selain menjadi tempat ibadah, masjid ini turut menganjurkan pelbagai aktiviti dan program yang menyokong pembangunan rohani serta kebajikan komuniti.",
    "Masjid ini menjadi tempat pertemuan masyarakat untuk melaksanakan ibadah, mengikuti program keilmuan dan menyertai aktiviti yang memberi manfaat kepada jemaah.",
    "Sebagai pusat ibadah setempat, masjid ini memainkan peranan penting dalam menyampaikan maklumat, menganjurkan program keagamaan dan menyokong aktiviti komuniti.",
    "Masjid ini diwujudkan untuk memenuhi keperluan ibadah masyarakat setempat serta menjadi pusat aktiviti yang menyatukan jemaah melalui pelbagai program bermanfaat.",
    "Dengan peranan sebagai pusat ibadah dan komuniti, masjid ini sentiasa berusaha menyediakan persekitaran yang kondusif untuk jemaah dan aktiviti kemasyarakatan.",
    "Masjid ini berfungsi sebagai pusat ibadah harian serta penganjuran program keagamaan dan aktiviti sosial yang bertujuan memperkukuh ukhuwah dalam komuniti.",
    "Sebagai institusi komuniti, masjid ini menjadi tempat ibadah, penyampaian ilmu dan pelaksanaan aktiviti yang menyokong keharmonian masyarakat setempat.",
];

// Form data type
interface OnboardingData {
    // Step 1
    name: string;
    slug: string;
    state: string;
    zone_code: string;
    // Step 2
    logo_url: string;
    hero_image_url: string;
    tagline: string;
    about_text: string;
    brand_color: string;
    // Step 3
    address: string;
    google_maps_location: string;
    phone: string;
    whatsapp_link: string;
    email: string;
    facebook_url: string;
    instagram_url: string;
    telegram_url: string;
    tiktok_url: string;
    youtube_url: string;
    // Step 4
    first_announcement_title: string;
    first_announcement_content: string;
}

const initialData: OnboardingData = {
    name: "",
    slug: "",
    state: "",
    zone_code: "",
    logo_url: "",
    hero_image_url: "",
    tagline: "",
    about_text: "",
    brand_color: "#4F46E5",
    address: "",
    google_maps_location: "",
    phone: "",
    whatsapp_link: "",
    email: "",
    facebook_url: "",
    instagram_url: "",
    telegram_url: "",
    tiktok_url: "",
    youtube_url: "",
    first_announcement_title: "",
    first_announcement_content: "",
};

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialData);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Toggle states for Logo and Hero
    const [hasOwnLogo, setHasOwnLogo] = useState(true);
    const [hasOwnHero, setHasOwnHero] = useState(true);

    // Index states for randomization
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [aboutTextIndex, setAboutTextIndex] = useState(0);

    // Randomize handlers
    function handleRandomizeTagline() {
        const nextIndex = (taglineIndex + 1) % TAGLINE_OPTIONS.length;
        setTaglineIndex(nextIndex);
        updateData("tagline", TAGLINE_OPTIONS[nextIndex]);
    }

    function handleRandomizeAboutText() {
        const nextIndex = (aboutTextIndex + 1) % ABOUT_TEXT_OPTIONS.length;
        setAboutTextIndex(nextIndex);
        updateData("about_text", ABOUT_TEXT_OPTIONS[nextIndex]);
    }

    // Get current user
    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUserId(user.id);
        }
        getUser();
    }, [router]);

    // Update zones when state changes
    useEffect(() => {
        if (data.state) {
            const newZones = getZonesByState(data.state);
            setZones(newZones);
            // Reset zone if not in new list
            if (!newZones.find((z) => z.code === data.zone_code)) {
                setData((prev) => ({ ...prev, zone_code: "" }));
            }
        }
    }, [data.state, data.zone_code]);

    // Auto-generate slug from name
    function generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 50);
    }

    function updateData(field: keyof OnboardingData, value: string) {
        setData((prev) => {
            const updated = { ...prev, [field]: value };
            // Auto-generate slug when name changes
            if (field === "name") {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    }

    function canProceed(): boolean {
        switch (step) {
            case 1:
                return !!(data.name && data.slug && data.state && data.zone_code);
            case 2:
                return true; // All optional
            case 3:
                return !!data.address; // Only address is required
            case 4:
                return true; // Optional
            default:
                return false;
        }
    }


    async function handleComplete() {
        if (!userId) {
            toast.error("Sesi tamat. Sila log masuk semula.");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            // Check if slug is available
            const { data: existingMosque } = await supabase
                .from("mosques")
                .select("id")
                .eq("slug", data.slug)
                .single();

            if (existingMosque) {
                toast.error("Slug ini sudah digunakan. Sila pilih yang lain.");
                setLoading(false);
                setStep(1);
                return;
            }

            let resolvedInput = data.google_maps_location;
            if (data.google_maps_location.includes("maps.app.goo.gl")) {
                resolvedInput = await resolveGoogleMapsLink(data.google_maps_location);
            }

            // Parse google maps location
            const { google_maps_url, google_maps_name, latitude, longitude } = (function parseLocation(input: string) {
                if (!input) return { google_maps_url: null, google_maps_name: null, latitude: null, longitude: null };
                const trimmed = input.trim();

                // Check for Google Maps Place URL (Resolved)
                if (trimmed.includes("google.com/maps/place")) {
                    // Try to extract coordinates from @lat,lng
                    const coordMatch = trimmed.match(/@([-+]?[\d.]+),([-+]?[\d.]+)/);
                    let lat = null;
                    let lng = null;
                    let name = null;

                    if (coordMatch) {
                        lat = parseFloat(coordMatch[1]);
                        lng = parseFloat(coordMatch[2]);
                    }

                    // Try to extract name from /place/NAME/
                    const nameMatch = trimmed.match(/\/place\/([^/]+)\//);
                    if (nameMatch) {
                        name = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
                    }

                    return {
                        google_maps_url: trimmed,
                        google_maps_name: name,
                        latitude: lat,
                        longitude: lng
                    };
                }

                if (trimmed.startsWith("http") || trimmed.includes("google.com/maps") || trimmed.includes("maps.app.goo.gl")) {
                    return { google_maps_url: trimmed, google_maps_name: null, latitude: null, longitude: null };
                }
                const coordMatch = trimmed.match(/^([-+]?[\d.]+)[,\s]+([-+]?[\d.]+)$/);
                if (coordMatch) {
                    return { google_maps_url: null, google_maps_name: null, latitude: parseFloat(coordMatch[1]), longitude: parseFloat(coordMatch[2]) };
                }
                return { google_maps_url: null, google_maps_name: trimmed, latitude: null, longitude: null };
            })(resolvedInput);

            // Create mosque
            const { data: mosque, error: mosqueError } = await supabase
                .from("mosques")
                .insert({
                    slug: data.slug,
                    name: data.name,
                    state: data.state,
                    zone_code: data.zone_code,
                    logo_url: hasOwnLogo ? (data.logo_url || null) : null,
                    hero_image_url: hasOwnHero
                        ? (data.hero_image_url || null)
                        : "https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp",
                    tagline: data.tagline || null,
                    about_text: data.about_text || null,
                    brand_color: data.brand_color || "#4F46E5",
                    address: data.address,
                    google_maps_name,
                    google_maps_url,
                    latitude,
                    longitude,
                    phone: data.phone || null,
                    email: data.email || null,
                    whatsapp_link: data.whatsapp_link || null,
                    facebook_url: data.facebook_url || null,
                    instagram_url: data.instagram_url || null,
                    telegram_url: data.telegram_url || null,
                    tiktok_url: data.tiktok_url || null,
                    youtube_url: data.youtube_url || null,
                    is_published: true,
                })
                .select()
                .single();

            if (mosqueError) {
                throw mosqueError;
            }

            // Create admin record
            const { error: adminError } = await supabase.from("admins").insert({
                id: userId,
                mosque_id: mosque.id,
                email: data.email || null,
            });

            if (adminError) {
                throw adminError;
            }

            // Create first announcement if provided
            if (data.first_announcement_title && data.first_announcement_content) {
                await supabase.from("announcements").insert({
                    mosque_id: mosque.id,
                    title: data.first_announcement_title,
                    content: data.first_announcement_content,
                    category: "umum",
                    is_active: true,
                });
            }

            toast.success("Tahniah! Laman web masjid anda telah dicipta!");
            router.push("/admin");
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Onboarding error full details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                error
            });
            toast.error(`Ralat: ${error.message || "Sila cuba lagi."}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-slide-up">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`progress-step ${s < step
                                    ? "progress-step-completed"
                                    : s === step
                                        ? "progress-step-active"
                                        : "progress-step-inactive"
                                    }`}
                            >
                                {s < step ? <Check size={18} /> : s}
                            </div>
                            {s < 4 && (
                                <div
                                    className={`w-8 h-1 mx-1 rounded ${s < step ? "bg-green-500" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-gray-600 text-sm">
                    Langkah {step} daripada 4
                </p>
            </div>

            {/* Form Card */}
            <div className="glass-card p-6 md:p-8">
                {/* Step 1: Maklumat Asas */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Maklumat Asas</h1>
                            <p className="text-gray-600 mt-1">Masukkan butiran masjid anda</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Nama Masjid *</Label>
                            <Input
                                placeholder="cth: Masjid Al-Hidayah"
                                value={data.name}
                                onChange={(e) => updateData("name", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Alamat Web (Slug) *</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="masjid-al-hidayah"
                                    value={data.slug}
                                    onChange={(e) => updateData("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                    className="form-input"
                                />
                                <span className="text-gray-500 text-sm whitespace-nowrap">.mosq.io</span>
                            </div>
                            <p className="text-xs text-gray-500">Ini akan menjadi alamat laman web anda</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Negeri *</Label>
                            <Select value={data.state} onValueChange={(v) => updateData("state", v)}>
                                <SelectTrigger className="form-input w-full">
                                    <SelectValue placeholder="Pilih negeri" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATES.map((state) => (
                                        <SelectItem key={state} value={state}>
                                            {state}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Zon Waktu Solat *</Label>
                            <Select
                                value={data.zone_code}
                                onValueChange={(v) => updateData("zone_code", v)}
                                disabled={!data.state}
                            >
                                <SelectTrigger className="form-input w-full">
                                    <SelectValue placeholder={data.state ? "Pilih zon" : "Pilih negeri dahulu"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((zone) => (
                                        <SelectItem key={zone.code} value={zone.code}>
                                            {zone.code} - {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Step 2: Penampilan */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Penampilan</h1>
                            <p className="text-gray-600 mt-1">Hias laman web masjid anda</p>
                        </div>

                        <div className="space-y-4">
                            <Label className="form-label">Logo Masjid</Label>
                            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setHasOwnLogo(true)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${hasOwnLogo ? "bg-white shadow-sm text-black font-bold" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Saya ada logo sendiri
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHasOwnLogo(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!hasOwnLogo ? "bg-white shadow-sm text-black font-bold" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Guna nama masjid sahaja
                                </button>
                            </div>

                            {hasOwnLogo ? (
                                <ImageUpload
                                    value={data.logo_url}
                                    onChange={(url) => updateData("logo_url", url)}
                                    label="Muat naik logo masjid"
                                    aspectRatio="square"
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                                    <p className="text-gray-600 font-medium">{data.name || "Nama Masjid"}</p>
                                    <p className="text-xs text-gray-500 mt-1">Logo akan dipaparkan sebagai teks</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label className="form-label">Gambar Hero</Label>
                            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setHasOwnHero(true)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${hasOwnHero ? "bg-white shadow-sm text-black font-bold" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Saya ada gambar masjid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHasOwnHero(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!hasOwnHero ? "bg-white shadow-sm text-black font-bold" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Guna corak default
                                </button>
                            </div>

                            {hasOwnHero ? (
                                <ImageUpload
                                    value={data.hero_image_url}
                                    onChange={(url) => updateData("hero_image_url", url)}
                                    label="Gambar utama laman web"
                                    aspectRatio="wide"
                                />
                            ) : (
                                <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-gray-200">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp')" }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <p className="text-white font-medium">Corak Default Digunakan</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="form-label">Tagline</Label>
                                <button
                                    type="button"
                                    onClick={handleRandomizeTagline}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                    title="Jana tagline secara rawak"
                                >
                                    <Shuffle size={12} />
                                    Jana Idea
                                </button>
                            </div>
                            <Input
                                placeholder="cth: Masjid Tumpuan Umat"
                                value={data.tagline}
                                onChange={(e) => updateData("tagline", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="form-label">Tentang Masjid</Label>
                                <button
                                    type="button"
                                    onClick={handleRandomizeAboutText}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                    title="Jana teks secara rawak"
                                >
                                    <Shuffle size={12} />
                                    Jana Idea
                                </button>
                            </div>
                            <Textarea
                                placeholder="Ceritakan sedikit tentang masjid anda..."
                                value={data.about_text}
                                onChange={(e) => updateData("about_text", e.target.value)}
                                className="form-input min-h-[120px]"
                                maxLength={300}
                            />
                            <p className="text-xs text-gray-500 text-right">
                                {data.about_text.length}/300 aksara
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Label className="form-label">Warna Jenama</Label>
                            <p className="text-sm text-gray-600 mb-3">
                                Pilih warna aksen untuk laman web masjid anda
                            </p>
                            <Select value={data.brand_color} onValueChange={(v) => updateData("brand_color", v)}>
                                <SelectTrigger className="form-input w-full">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded-md border border-gray-200"
                                            style={{ backgroundColor: data.brand_color }}
                                        />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="#4F46E5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4F46E5" }} />
                                            Indigo
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#7C3AED">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7C3AED" }} />
                                            Violet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#9333EA">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#9333EA" }} />
                                            Purple
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#C026D3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#C026D3" }} />
                                            Fuchsia
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#E11D48">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E11D48" }} />
                                            Rose
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#DC2626">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DC2626" }} />
                                            Red
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#EA580C">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#EA580C" }} />
                                            Orange
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#D97706">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#D97706" }} />
                                            Amber
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#CA8A04">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#CA8A04" }} />
                                            Yellow
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#65A30D">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#65A30D" }} />
                                            Lime
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#16A34A">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#16A34A" }} />
                                            Green
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#059669">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#059669" }} />
                                            Emerald
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#0D9488">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#0D9488" }} />
                                            Teal
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#0891B2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#0891B2" }} />
                                            Cyan
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#0284C7">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#0284C7" }} />
                                            Sky
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#2563EB">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#2563EB" }} />
                                            Blue
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#475569">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#475569" }} />
                                            Slate
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="#1F2937">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1F2937" }} />
                                            Gray
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Step 3: Maklumat Hubungan */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Maklumat Hubungan</h1>
                            <p className="text-gray-600 mt-1">Cara jemaah menghubungi masjid</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="form-label">
                                    Google Maps <span className="text-gray-400 font-normal">- Optional</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan URL, Nama Masjid, atau Koordinat (Lat, Lng)"
                                    value={data.google_maps_location}
                                    onChange={(e) => updateData("google_maps_location", e.target.value)}
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500">
                                    Sistem akan mengesan format URL, Nama, atau Koordinat secara automatik untuk paparan peta yang tepat.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Alamat Penuh *</Label>
                            <Textarea
                                placeholder="Masukkan alamat lengkap masjid..."
                                value={data.address}
                                onChange={(e) => updateData("address", e.target.value)}
                                className="form-input min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="form-label">No. Telefon</Label>
                                <Input
                                    type="tel"
                                    placeholder="cth: 03-12345678"
                                    value={data.phone}
                                    onChange={(e) => updateData("phone", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">WhatsApp</Label>
                                <Input
                                    placeholder="cth: 0123456789"
                                    value={data.whatsapp_link}
                                    onChange={(e) => updateData("whatsapp_link", e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">E-mel</Label>
                            <Input
                                type="email"
                                placeholder="info@masjid.com"
                                value={data.email}
                                onChange={(e) => updateData("email", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Media Sosial (Pilihan)</p>

                            <div className="space-y-2">
                                <Label className="form-label">Facebook</Label>
                                <Input
                                    placeholder="https://facebook.com/masjidanda"
                                    value={data.facebook_url}
                                    onChange={(e) => updateData("facebook_url", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Instagram</Label>
                                <Input
                                    placeholder="https://instagram.com/masjidanda"
                                    value={data.instagram_url}
                                    onChange={(e) => updateData("instagram_url", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Telegram</Label>
                                <Input
                                    placeholder="https://t.me/masjidanda"
                                    value={data.telegram_url}
                                    onChange={(e) => updateData("telegram_url", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">TikTok</Label>
                                <Input
                                    placeholder="https://tiktok.com/@masjidanda"
                                    value={data.tiktok_url}
                                    onChange={(e) => updateData("tiktok_url", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">YouTube</Label>
                                <Input
                                    placeholder="https://youtube.com/@masjidanda"
                                    value={data.youtube_url}
                                    onChange={(e) => updateData("youtube_url", e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Pengumuman Pertama */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Pengumuman Pertama</h1>
                            <p className="text-gray-600 mt-1">Cipta pengumuman untuk jemaah (pilihan)</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Tajuk Pengumuman</Label>
                            <Input
                                placeholder="cth: Selamat Datang ke Laman Web Baharu"
                                value={data.first_announcement_title}
                                onChange={(e) => updateData("first_announcement_title", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Isi Pengumuman</Label>
                            <Textarea
                                placeholder="Tulis pengumuman anda di sini..."
                                value={data.first_announcement_content}
                                onChange={(e) => updateData("first_announcement_content", e.target.value)}
                                className="form-input min-h-[150px]"
                            />
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-700">
                                ✨ Anda boleh langkau langkah ini dan tambah pengumuman kemudian di papan pemuka
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="btn-secondary"
                        >
                            <ChevronLeft size={20} className="mr-1" />
                            Kembali
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <Button
                            type="button"
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="btn-primary"
                        >
                            Seterusnya
                            <ChevronRight size={20} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleComplete}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mencipta laman web...
                                </>
                            ) : (
                                "Siap! Cipta Laman Web"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
