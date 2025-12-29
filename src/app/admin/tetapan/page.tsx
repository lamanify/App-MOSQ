"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Mosque, MosqueUpdate } from "@/lib/supabase/types";
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
import { Loader2, Save, Building2, CreditCard, Globe, Phone, Palette, Shuffle, Clock, Info } from "lucide-react";
import { revalidateMosqueData } from "@/app/actions/mosque";

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

type TabType = "profil" | "hubungan" | "dana" | "waktu_solat" | "penampilan";

export default function TetapanPage() {
    const [mosque, setMosque] = useState<Mosque | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [googleMapsInput, setGoogleMapsInput] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("profil");
    const [zones, setZones] = useState<Zone[]>([]);

    // Index states for randomization
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [aboutTextIndex, setAboutTextIndex] = useState(0);

    // Randomize handlers
    function handleRandomizeTagline() {
        const nextIndex = (taglineIndex + 1) % TAGLINE_OPTIONS.length;
        setTaglineIndex(nextIndex);
        updateField("tagline", TAGLINE_OPTIONS[nextIndex]);
    }

    function handleRandomizeAboutText() {
        const nextIndex = (aboutTextIndex + 1) % ABOUT_TEXT_OPTIONS.length;
        setAboutTextIndex(nextIndex);
        updateField("about_text", ABOUT_TEXT_OPTIONS[nextIndex]);
    }

    // Form state
    const [formData, setFormData] = useState<Partial<MosqueUpdate>>({});

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (formData.state) {
            setZones(getZonesByState(formData.state));
        }
    }, [formData.state]);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: admin } = await supabase
            .from("admins")
            .select("mosque_id")
            .eq("id", user.id)
            .single();

        if (admin?.mosque_id) {
            const { data: mosqueData } = await supabase
                .from("mosques")
                .select("*")
                .eq("id", admin.mosque_id)
                .single();

            if (mosqueData) {
                setMosque(mosqueData);
                setFormData(mosqueData);
                if (mosqueData.state) {
                    setZones(getZonesByState(mosqueData.state));
                }
                setGoogleMapsInput(
                    mosqueData.google_maps_url ||
                    (mosqueData.latitude && mosqueData.longitude ? `${mosqueData.latitude}, ${mosqueData.longitude}` : "") ||
                    mosqueData.google_maps_name || ""
                );
            }
        }
        setLoading(false);
    }

    function updateField(field: keyof MosqueUpdate, value: string | boolean | number | null) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        if (!mosque) return;

        setSaving(true);
        const supabase = createClient();


        // Simple Google Maps name assignment (text only)
        const google_maps_name = googleMapsInput?.trim() || null;

        const updatedData = {
            ...formData,
            google_maps_name
        };


        try {
            const { error } = await supabase
                .from("mosques")
                .update(updatedData)
                .eq("id", mosque.id);

            if (error) throw error;

            // Revalidate public pages
            if (formData.slug) {
                await revalidateMosqueData(formData.slug);
            }

            toast.success("Tetapan berjaya disimpan!");
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Ralat berlaku. Sila cuba lagi.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    const tabs = [
        { id: "profil" as TabType, label: "Profil Masjid", icon: Building2 },
        { id: "hubungan" as TabType, label: "Maklumat Hubungan", icon: Phone },
        { id: "dana" as TabType, label: "Dana Masjid", icon: CreditCard },
        { id: "waktu_solat" as TabType, label: "Waktu Solat", icon: Clock },
        { id: "penampilan" as TabType, label: "Penampilan", icon: Palette },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tetapan</h1>
                    <p className="text-gray-600">Kemaskini profil dan tetapan masjid</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-orange-600 text-white hover:bg-orange-700 h-14 px-10 text-lg font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                        <Save size={20} className="mr-2" />
                    )}
                    Simpan Perubahan
                </Button>
            </div>

            {/* Tabs */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${activeTab === tab.id
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="glass-card p-6">
                {/* Profil Masjid Tab */}
                {activeTab === "profil" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="form-label">Nama Masjid *</Label>
                                <Input
                                    value={formData.name || ""}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Slug (Alamat Web)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={formData.slug || ""}
                                        onChange={(e) => updateField("slug", e.target.value)}
                                        className="form-input"
                                    />
                                    <span className="text-gray-500 text-sm whitespace-nowrap">.mosq.io</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Negeri</Label>
                                <Select
                                    value={formData.state || ""}
                                    onValueChange={(v) => updateField("state", v)}
                                >
                                    <SelectTrigger className="form-input">
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
                                <Label className="form-label">Zon Waktu Solat</Label>
                                <Select
                                    value={formData.zone_code || ""}
                                    onValueChange={(v) => updateField("zone_code", v)}
                                >
                                    <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Pilih zon" />
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
                                value={formData.tagline || ""}
                                onChange={(e) => updateField("tagline", e.target.value)}
                                placeholder="cth: Masjid Tumpuan Umat"
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
                                value={formData.about_text || ""}
                                onChange={(e) => updateField("about_text", e.target.value)}
                                placeholder="Ceritakan tentang masjid anda..."
                                className="form-input min-h-[120px]"
                                maxLength={300}
                            />
                            <p className="text-xs text-gray-500 text-right">
                                {(formData.about_text || "").length}/300 aksara
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="form-label">Logo Masjid</Label>
                                <ImageUpload
                                    value={formData.logo_url || ""}
                                    onChange={(url) => updateField("logo_url", url)}
                                    aspectRatio="square"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Gambar Hero</Label>
                                <ImageUpload
                                    value={formData.hero_image_url || ""}
                                    onChange={(url) => updateField("hero_image_url", url)}
                                    aspectRatio="wide"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={formData.is_published || false}
                                onChange={(e) => updateField("is_published", e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300"
                            />
                            <div>
                                <Label htmlFor="isPublished" className="font-bold text-black">
                                    Terbitkan Laman Web
                                </Label>
                                <p className="text-sm text-gray-500">
                                    Laman web akan dapat diakses oleh orang ramai
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Maklumat Hubungan Tab */}
                {activeTab === "hubungan" && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="form-label">
                                            Nama Lokasi Google Maps <span className="text-gray-400 font-normal">- Optional</span>
                                        </Label>
                                        <button
                                            type="button"
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                            onClick={() => {
                                                const modal = document.createElement('div');
                                                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                                                modal.onclick = () => modal.remove();
                                                modal.innerHTML = `
                                                    <div class="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
                                                        <div class="flex justify-between items-center mb-4">
                                                            <h3 class="text-lg font-semibold">Contoh: Cara Dapatkan Nama Lokasi</h3>
                                                            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">✕</button>
                                                        </div>
                                                        <img src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766984676/Screenshot_at_Dec_29_13-03-29_rpad1a.png" alt="Contoh Google Maps" class="w-full rounded" />
                                                    </div>
                                                `;
                                                document.body.appendChild(modal);
                                            }}
                                        >
                                            <Info className="w-4 h-4" />
                                            Lihat Contoh sini
                                        </button>
                                    </div>
                                    <Input
                                        value={googleMapsInput}
                                        onChange={(e) => setGoogleMapsInput(e.target.value)}
                                        placeholder="Contoh: Masjid Negara"
                                        className="form-input"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Nama lokasi masjid di Google Maps. Sila masukkan teks sahaja, tiada URL.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Alamat Penuh</Label>
                                <Textarea
                                    value={formData.address || ""}
                                    onChange={(e) => updateField("address", e.target.value)}
                                    placeholder="Masukkan alamat lengkap masjid..."
                                    className="form-input min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="form-label">No. Telefon</Label>
                                <Input
                                    value={formData.phone || ""}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    placeholder="cth: 03-12345678"
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">WhatsApp</Label>
                                <Input
                                    value={formData.whatsapp_link || ""}
                                    onChange={(e) => updateField("whatsapp_link", e.target.value)}
                                    placeholder="cth: 0123456789"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">E-mel</Label>
                            <Input
                                value={formData.email || ""}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="info@masjid.com"
                                className="form-input"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-4">
                                <Globe size={16} className="inline mr-2" />
                                Media Sosial
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="form-label">Facebook</Label>
                                    <Input
                                        value={formData.facebook_url || ""}
                                        onChange={(e) => updateField("facebook_url", e.target.value)}
                                        placeholder="https://facebook.com/masjidanda"
                                        className="form-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="form-label">Instagram</Label>
                                    <Input
                                        value={formData.instagram_url || ""}
                                        onChange={(e) => updateField("instagram_url", e.target.value)}
                                        placeholder="https://instagram.com/masjidanda"
                                        className="form-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="form-label">Telegram</Label>
                                    <Input
                                        value={formData.telegram_url || ""}
                                        onChange={(e) => updateField("telegram_url", e.target.value)}
                                        placeholder="https://t.me/masjidanda"
                                        className="form-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="form-label">TikTok</Label>
                                    <Input
                                        value={formData.tiktok_url || ""}
                                        onChange={(e) => updateField("tiktok_url", e.target.value)}
                                        placeholder="https://tiktok.com/@masjidanda"
                                        className="form-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="form-label">YouTube</Label>
                                    <Input
                                        value={formData.youtube_url || ""}
                                        onChange={(e) => updateField("youtube_url", e.target.value)}
                                        placeholder="https://youtube.com/@masjidanda"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dana Masjid Tab */}
                {activeTab === "dana" && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-sm text-blue-700 font-medium">
                                💳 Maklumat ini akan dipaparkan di laman web untuk memudahkan jemaah membuat sumbangan.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Nama Bank</Label>
                            <Input
                                value={formData.bank_name || ""}
                                onChange={(e) => updateField("bank_name", e.target.value)}
                                placeholder="cth: Maybank, CIMB, Bank Islam"
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Nama Akaun</Label>
                            <Input
                                value={formData.bank_account_name || ""}
                                onChange={(e) => updateField("bank_account_name", e.target.value)}
                                placeholder="cth: Tabung Masjid Al-Hidayah"
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">No. Akaun</Label>
                            <Input
                                value={formData.bank_account_number || ""}
                                onChange={(e) => updateField("bank_account_number", e.target.value)}
                                placeholder="cth: 1234567890"
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Kod QR (DuitNow/Touch &apos;n Go)</Label>
                            <ImageUpload
                                value={formData.donation_qr_url || ""}
                                onChange={(url) => updateField("donation_qr_url", url)}
                                label="Muat naik kod QR"
                                aspectRatio="square"
                            />
                            <p className="text-xs text-gray-500">
                                Muat naik gambar kod QR untuk memudahkan sumbangan
                            </p>
                        </div>
                    </div>
                )}

                {/* Waktu Solat Tab */}
                {activeTab === "waktu_solat" && (
                    <div className="space-y-8">
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                            <p className="text-sm text-orange-700 font-medium">
                                🕌 Tetapkan masa Iqamah (minit selepas waktu solat) untuk setiap waktu solat.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="iqamahCustomEnabled"
                                checked={formData.iqamah_custom_enabled || false}
                                onChange={(e) => updateField("iqamah_custom_enabled", e.target.checked)}
                                className="w-6 h-6 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <div>
                                <Label htmlFor="iqamahCustomEnabled" className="text-lg font-bold text-gray-900">
                                    Guna Masa Iqamah Tersuai
                                </Label>
                                <p className="text-sm text-gray-500">
                                    Aktifkan untuk mengubahsuai masa Iqamah. Jika dinyahaktifkan, 10 minit akan digunakan secara automatik.
                                </p>
                            </div>
                        </div>

                        {formData.iqamah_custom_enabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                {[
                                    { id: "iqamah_subuh", label: "Subuh" },
                                    { id: "iqamah_zohor", label: "Zohor" },
                                    { id: "iqamah_asar", label: "Asar" },
                                    { id: "iqamah_maghrib", label: "Maghrib" },
                                    { id: "iqamah_isyak", label: "Isyak" },
                                ].map((prayer) => {
                                    const field = prayer.id as keyof MosqueUpdate;
                                    const rawValue = formData[field];
                                    const value = typeof rawValue === "number" ? rawValue : 10;

                                    return (
                                        <div key={prayer.id} className="space-y-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <Label className="form-label text-gray-900">{prayer.label} (Minit)</Label>
                                            <div className="relative group">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    value={value}
                                                    onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
                                                    className="form-input text-lg font-bold h-12 pr-12 focus:border-orange-500 focus:ring-orange-500"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                                    min
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!formData.iqamah_custom_enabled && (
                            <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Masa Iqamah ditetapkan kepada 10 minit secara lalai.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Penampilan Tab */}
                {activeTab === "penampilan" && (
                    <div className="space-y-8">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <p className="text-sm text-gray-600 font-medium">
                                🎨 Pilih warna jenama untuk laman web masjid anda. Warna ini akan digunakan sebagai warna aksen utama.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Label className="form-label">Warna Jenama</Label>

                            {/* Preset Colors Grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {[
                                    { color: "#4F46E5", name: "Indigo" },
                                    { color: "#7C3AED", name: "Violet" },
                                    { color: "#9333EA", name: "Purple" },
                                    { color: "#C026D3", name: "Fuchsia" },
                                    { color: "#E11D48", name: "Rose" },
                                    { color: "#DC2626", name: "Red" },
                                    { color: "#EA580C", name: "Orange" },
                                    { color: "#D97706", name: "Amber" },
                                    { color: "#CA8A04", name: "Yellow" },
                                    { color: "#65A30D", name: "Lime" },
                                    { color: "#16A34A", name: "Green" },
                                    { color: "#059669", name: "Emerald" },
                                    { color: "#0D9488", name: "Teal" },
                                    { color: "#0891B2", name: "Cyan" },
                                    { color: "#0284C7", name: "Sky" },
                                    { color: "#2563EB", name: "Blue" },
                                    { color: "#475569", name: "Slate" },
                                    { color: "#1F2937", name: "Gray" },
                                ].map((preset) => (
                                    <button
                                        key={preset.color}
                                        type="button"
                                        onClick={() => updateField("brand_color", preset.color)}
                                        className={`
                                            group relative w-full aspect-square rounded-xl transition-all duration-200
                                            hover:scale-110 hover:shadow-lg hover:z-10
                                            ${formData.brand_color === preset.color
                                                ? 'ring-2 ring-offset-2 ring-gray-900 scale-110 shadow-lg'
                                                : 'ring-1 ring-gray-200 hover:ring-gray-300'}
                                        `}
                                        style={{ backgroundColor: preset.color }}
                                        title={preset.name}
                                    >
                                        {formData.brand_color === preset.color && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Color Input */}
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.brand_color || "#4F46E5"}
                                        onChange={(e) => updateField("brand_color", e.target.value)}
                                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Warna Tersuai</p>
                                        <p className="text-xs text-gray-500">Klik untuk pilih warna lain</p>
                                    </div>
                                </div>
                                <Input
                                    value={formData.brand_color || "#4F46E5"}
                                    onChange={(e) => updateField("brand_color", e.target.value)}
                                    placeholder="#4F46E5"
                                    className="form-input w-32 font-mono text-sm uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="space-y-4">
                            <Label className="form-label">Pratonton</Label>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                                <p className="text-sm text-gray-500 mb-4">Ini adalah contoh bagaimana warna jenama akan dipaparkan di laman web anda:</p>

                                {/* Preview Elements */}
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-full text-white font-bold transition-all"
                                        style={{ backgroundColor: formData.brand_color || "#4F46E5" }}
                                    >
                                        Butang Utama
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-full font-bold border-2 transition-all"
                                        style={{
                                            borderColor: formData.brand_color || "#4F46E5",
                                            color: formData.brand_color || "#4F46E5"
                                        }}
                                    >
                                        Butang Sekunder
                                    </button>
                                </div>

                                <div className="flex items-center gap-6">
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="font-medium underline"
                                        style={{ color: formData.brand_color || "#4F46E5" }}
                                    >
                                        Pautan Contoh
                                    </a>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                        style={{ backgroundColor: formData.brand_color || "#4F46E5" }}
                                    >
                                        <Palette size={20} />
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: formData.brand_color || "#4F46E5" }}
                                        />
                                        <p className="text-sm text-gray-600">
                                            Warna aksen akan digunakan untuk butang, pautan, dan elemen interaktif.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
