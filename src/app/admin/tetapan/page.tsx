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
import { Loader2, Save, Building2, CreditCard, Globe, Phone, Palette } from "lucide-react";
import { revalidateMosqueData } from "@/app/actions/mosque";

type TabType = "profil" | "hubungan" | "dana" | "penampilan";

export default function TetapanPage() {
    const [mosque, setMosque] = useState<Mosque | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("profil");
    const [zones, setZones] = useState<Zone[]>([]);

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
            }
        }
        setLoading(false);
    }

    function updateField(field: keyof MosqueUpdate, value: string | boolean | null) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        if (!mosque) return;

        setSaving(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("mosques")
                .update(formData)
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
                            <Label className="form-label">Tagline</Label>
                            <Input
                                value={formData.tagline || ""}
                                onChange={(e) => updateField("tagline", e.target.value)}
                                placeholder="cth: Masjid Tumpuan Umat"
                                className="form-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="form-label">Tentang Masjid</Label>
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
                            <div className="space-y-2">
                                <Label className="form-label">
                                    Nama di Google Maps <span className="text-gray-400 font-normal">(Sekiranya Ada) - Optional</span>
                                </Label>
                                <Input
                                    value={formData.google_maps_name || ""}
                                    onChange={(e) => updateField("google_maps_name", e.target.value)}
                                    placeholder="cth: Masjid Al-Hidayah (Official)"
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500">
                                    Digunakan untuk carian lokasi yang lebih tepat di Google Maps
                                </p>
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
