"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CommitteeMember, CommitteeMemberInsert } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, X, GripVertical } from "lucide-react";

export default function AJKPage() {
    const [members, setMembers] = useState<CommitteeMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [mosqueId, setMosqueId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<CommitteeMember | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

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
                .from("committee_members")
                .select("*")
                .eq("mosque_id", admin.mosque_id)
                .order("display_order", { ascending: true });

            if (data) setMembers(data);
        }
        setLoading(false);
    }

    function resetForm() {
        setName("");
        setRole("");
        setEditing(null);
        setShowForm(false);
    }

    function handleEdit(member: CommitteeMember) {
        setEditing(member);
        setName(member.name);
        setRole(member.role);
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
                    .from("committee_members")
                    .update({ name, role })
                    .eq("id", editing.id);

                if (error) throw error;
                toast.success("Ahli AJK berjaya dikemaskini!");
            } else {
                // Get max display_order
                const maxOrder = members.length > 0
                    ? Math.max(...members.map(m => m.display_order)) + 1
                    : 0;

                const { error } = await supabase.from("committee_members").insert({
                    mosque_id: mosqueId,
                    name,
                    role,
                    display_order: maxOrder,
                } as CommitteeMemberInsert);

                if (error) throw error;
                toast.success("Ahli AJK berjaya ditambah!");
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
        if (!confirm("Adakah anda pasti mahu padam ahli AJK ini?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("committee_members").delete().eq("id", id);

        if (error) {
            toast.error("Gagal memadam ahli AJK");
        } else {
            toast.success("Ahli AJK berjaya dipadam");
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
                    <h1 className="text-2xl font-bold text-gray-900">Senarai AJK</h1>
                    <p className="text-gray-600">Urus ahli jawatankuasa masjid</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800">
                    <Plus size={20} className="mr-2" />
                    Tambah Ahli AJK
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editing ? "Edit Ahli AJK" : "Ahli AJK Baharu"}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="form-label">Nama Penuh *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="cth: Ahmad bin Abdullah"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="form-label">Jawatan *</Label>
                                <Input
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="cth: Pengerusi, Setiausaha, Bendahari"
                                    required
                                    className="form-input"
                                />
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

            {/* Members List */}
            {members.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-gray-500">Tiada ahli AJK lagi</p>
                    <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-zinc-800 mt-4">
                        Tambah Ahli AJK Pertama
                    </Button>
                </div>
            ) : (
                <div className="glass-card divide-y divide-gray-100">
                    {members.map((member, index) => (
                        <div key={member.id} className="flex items-center gap-4 p-4">
                            <div className="text-gray-400 cursor-grab">
                                <GripVertical size={20} />
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-black font-semibold">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors tap-target"
                                >
                                    <Pencil size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2 hover:bg-red-50 rounded-xl transition-colors tap-target"
                                >
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
