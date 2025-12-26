"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventInsert } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2, X, Calendar, MapPin, User } from "lucide-react";

export default function AktivitiPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [mosqueId, setMosqueId] = useState<string | null>(null);
    const [mosqueSlug, setMosqueSlug] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Event | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");
    const [speaker, setSpeaker] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublished, setIsPublished] = useState(true);

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

            // Fetch mosque details to get the slug for Cloudinary folder
            const { data: mosque } = await supabase
                .from("mosques")
                .select("slug")
                .eq("id", admin.mosque_id)
                .single();

            if (mosque?.slug) {
                setMosqueSlug(mosque.slug);
            }

            const { data } = await supabase
                .from("events")
                .select("*")
                .eq("mosque_id", admin.mosque_id)
                .order("event_date", { ascending: false });

            if (data) setEvents(data);
        }
        setLoading(false);
    }

    function resetForm() {
        setTitle("");
        setDescription("");
        setEventDate("");
        setEventTime("");
        setLocation("");
        setSpeaker("");
        setImageUrl("");
        setIsPublished(true);
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(event: Event) {
        setEditing(event);
        setTitle(event.title);
        setDescription(event.description || "");
        setEventDate(event.event_date);
        setEventTime(event.event_time || "");
        setLocation(event.location || "");
        setSpeaker(event.speaker || "");
        setImageUrl(event.featured_image_url || "");
        setIsPublished(event.is_published);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!mosqueId) return;

        setSaving(true);
        const supabase = createClient();

        const eventData: Partial<EventInsert> = {
            title,
            description: description || null,
            event_date: eventDate,
            event_time: eventTime || null,
            location: location || null,
            speaker: speaker || null,
            featured_image_url: imageUrl || null,
            is_published: isPublished,
            slug: slugify(title),
        };

        try {
            if (editing) {
                const { error } = await supabase
                    .from("events")
                    .update(eventData)
                    .eq("id", editing.id);

                if (error) throw error;
                toast.success("Aktiviti berjaya dikemaskini!");
            } else {
                const { error } = await supabase.from("events").insert({
                    mosque_id: mosqueId,
                    ...eventData,
                } as EventInsert);

                if (error) throw error;
                toast.success("Aktiviti berjaya ditambah!");
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
        if (!confirm("Adakah anda pasti mahu padam aktiviti ini?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("events").delete().eq("id", id);

        if (error) {
            toast.error("Gagal memadam aktiviti");
        } else {
            toast.success("Aktiviti berjaya dipadam");
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
                    <h1 className="text-2xl font-bold text-gray-900">Aktiviti & Program</h1>
                    <p className="text-gray-600">Urus program dan aktiviti masjid</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800">
                    <Plus size={20} className="mr-2" />
                    Tambah Aktiviti
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editing ? "Edit Aktiviti" : "Aktiviti Baharu"}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="form-label">Tajuk Aktiviti *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="cth: Ceramah Jumaat"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="form-label">Tarikh *</Label>
                                    <Input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="form-label">Masa</Label>
                                    <Input
                                        type="time"
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Lokasi</Label>
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="cth: Dewan Utama Masjid"
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Penceramah/Tetamu</Label>
                                <Input
                                    value={speaker}
                                    onChange={(e) => setSpeaker(e.target.value)}
                                    placeholder="cth: Ustaz Ahmad"
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Penerangan</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Penerangan aktiviti..."
                                    className="form-input min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Gambar</Label>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                    aspectRatio="wide"
                                    tenantFolder={mosqueSlug || undefined}
                                    subfolder="aktiviti"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300"
                                />
                                <Label htmlFor="isPublished" className="text-sm">
                                    Terbitkan aktiviti ini
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

            {/* Events List */}
            {events.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-gray-500">Tiada aktiviti lagi</p>
                    <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800 mt-4">
                        Cipta Aktiviti Pertama
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="glass-card overflow-hidden">
                            {event.featured_image_url && (
                                <div className="aspect-video bg-gray-100 relative">
                                    <img
                                        src={event.featured_image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${event.is_published
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {event.is_published ? "Diterbitkan" : "Draf"}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900">{event.title}</h3>

                                <div className="mt-3 space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(event.event_date).toLocaleDateString("ms-MY")}
                                            {event.event_time && ` • ${event.event_time}`}
                                        </span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                    {event.speaker && (
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>{event.speaker}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Padam
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
