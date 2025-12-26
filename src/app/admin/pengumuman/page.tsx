"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Announcement, AnnouncementInsert } from "@/lib/supabase/types";
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
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";

const CATEGORIES = [
    { value: "umum", label: "Umum" },
    { value: "aktiviti", label: "Aktiviti" },
    { value: "kewangan", label: "Kewangan" },
    { value: "waktu_solat", label: "Waktu Solat" },
    { value: "lain_lain", label: "Lain-lain" },
];

export default function PengumumanPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [mosqueId, setMosqueId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("umum");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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
            setMosqueId(admin.mosque_id);
            const { data } = await supabase
                .from("announcements")
                .select("*")
                .eq("mosque_id", admin.mosque_id)
                .order("created_at", { ascending: false });

            if (data) setAnnouncements(data);
        }
        setLoading(false);
    }

    function resetForm() {
        setTitle("");
        setContent("");
        setCategory("umum");
        setIsActive(true);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(announcement: Announcement) {
        setEditing(announcement);
        setTitle(announcement.title);
        setContent(announcement.content);
        setCategory(announcement.category);
        setIsActive(announcement.is_active);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!mosqueId) return;

        setSaving(true);
        const supabase = createClient();

        try {
            if (editing) {
                const { error } = await supabase
                    .from("announcements")
                    .update({
                        title,
                        content,
                        category: category as AnnouncementInsert["category"],
                        is_active: isActive,
                        slug: slugify(title),
                    })
                    .eq("id", editing.id);

                if (error) throw error;
                toast.success("Pengumuman berjaya dikemaskini!");
            } else {
                const { error } = await supabase.from("announcements").insert({
                    mosque_id: mosqueId,
                    title,
                    content,
                    category: category as AnnouncementInsert["category"],
                    is_active: isActive,
                    slug: slugify(title),
                });

                if (error) throw error;
                toast.success("Pengumuman berjaya ditambah!");
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Ralat berlaku. Sila cuba lagi.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Adakah anda pasti mahu padam pengumuman ini?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("announcements").delete().eq("id", id);

        if (error) {
            toast.error("Gagal memadam pengumuman");
        } else {
            toast.success("Pengumuman berjaya dipadam");
            loadData();
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
                    <p className="text-gray-600">Urus pengumuman masjid anda</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800">
                    <Plus size={20} className="mr-2" />
                    Tambah Pengumuman
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editing ? "Edit Pengumuman" : "Pengumuman Baharu"}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="form-label">Tajuk *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Masukkan tajuk pengumuman"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Kandungan *</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Tulis kandungan pengumuman..."
                                    required
                                    className="form-input min-h-[120px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Kategori</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="form-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300"
                                />
                                <Label htmlFor="isActive" className="text-sm">
                                    Aktifkan pengumuman ini
                                </Label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-zinc-800 flex-1">
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? "Kemaskini" : "Simpan"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-gray-500">Tiada pengumuman lagi</p>
                    <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800 mt-4">
                        Cipta Pengumuman Pertama
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="glass-card p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {announcement.is_active ? "Aktif" : "Tidak Aktif"}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            {CATEGORIES.find((c) => c.value === announcement.category)?.label}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(announcement.created_at).toLocaleDateString("ms-MY")}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(announcement)}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors tap-target"
                                    >
                                        <Pencil size={18} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 hover:bg-red-50 rounded-xl transition-colors tap-target"
                                    >
                                        <Trash2 size={18} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
