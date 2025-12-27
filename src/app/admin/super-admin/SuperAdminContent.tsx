"use client";

import { useState, useEffect } from "react";
import {
    listAllUsers,
    updateUserEmail,
    updateUserPassword,
    deleteUser,
    generateMagicLink,
    type UserWithMosque,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Search,
    Mail,
    Key,
    Trash2,
    LogIn,
    X,
    Users,
    Loader2,
    ExternalLink,
    Building,
} from "lucide-react";

interface ModalState {
    type: "email" | "password" | "delete" | "login" | null;
    user: UserWithMosque | null;
}

export function SuperAdminContent() {
    const [users, setUsers] = useState<UserWithMosque[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithMosque[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [modal, setModal] = useState<ModalState>({ type: null, user: null });
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [magicLink, setMagicLink] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.email.toLowerCase().includes(query) ||
                        user.mosque_name?.toLowerCase().includes(query) ||
                        user.mosque_slug?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    async function fetchUsers() {
        setLoading(true);
        const { users: fetchedUsers, error } = await listAllUsers();
        if (error) {
            toast.error(error);
        } else {
            setUsers(fetchedUsers);
            setFilteredUsers(fetchedUsers);
        }
        setLoading(false);
    }

    function openModal(type: ModalState["type"], user: UserWithMosque) {
        setModal({ type, user });
        setNewEmail(user.email);
        setNewPassword("");
        setMagicLink("");
    }

    function closeModal() {
        setModal({ type: null, user: null });
        setNewEmail("");
        setNewPassword("");
        setMagicLink("");
    }

    async function handleUpdateEmail() {
        if (!modal.user) return;
        setActionLoading(true);

        const { success, error } = await updateUserEmail(modal.user.id, newEmail);

        if (success) {
            toast.success("Emel berjaya dikemaskini");
            await fetchUsers();
            closeModal();
        } else {
            toast.error(error || "Gagal mengemaskini emel");
        }
        setActionLoading(false);
    }

    async function handleUpdatePassword() {
        if (!modal.user) return;
        setActionLoading(true);

        const { success, error } = await updateUserPassword(modal.user.id, newPassword);

        if (success) {
            toast.success("Kata laluan berjaya dikemaskini");
            closeModal();
        } else {
            toast.error(error || "Gagal mengemaskini kata laluan");
        }
        setActionLoading(false);
    }

    async function handleDeleteUser() {
        if (!modal.user) return;
        setActionLoading(true);

        const { success, error } = await deleteUser(modal.user.id);

        if (success) {
            toast.success("Pengguna berjaya dipadam");
            await fetchUsers();
            closeModal();
        } else {
            toast.error(error || "Gagal memadam pengguna");
        }
        setActionLoading(false);
    }

    async function handleGenerateLoginLink() {
        if (!modal.user) return;
        setActionLoading(true);

        const { link, error } = await generateMagicLink(modal.user.id);

        if (link) {
            setMagicLink(link);
            toast.success("Pautan log masuk berjaya dijana");
        } else {
            toast.error(error || "Gagal menjana pautan");
        }
        setActionLoading(false);
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span>MOSQ</span>
                        <span className="text-gray-300">/</span>
                        <span>Super Admin</span>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">
                        Pengurusan Pengguna
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 text-sm font-medium text-gray-600 gap-2 shadow-sm flex items-center">
                        <Users size={16} />
                        {users.length} Pengguna
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Cari pengguna mengikut emel atau nama masjid..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 form-input"
                />
            </div>

            {/* Users Table */}
            <div className="dashboard-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Emel
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Masjid
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Tarikh Daftar
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Log Masuk Terakhir
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Tindakan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="mx-auto animate-spin text-gray-400" size={32} />
                                        <p className="mt-2 text-sm text-gray-500">Memuatkan pengguna...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Users className="mx-auto text-gray-300" size={48} />
                                        <p className="mt-2 text-sm text-gray-500">Tiada pengguna dijumpai</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.mosque_name ? (
                                                <div className="flex items-center gap-2">
                                                    <Building size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.mosque_name}</p>
                                                        <p className="text-xs text-gray-500">{user.mosque_slug}.mosq.io</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Belum onboard</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString("ms-MY", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.last_sign_in_at
                                                ? new Date(user.last_sign_in_at).toLocaleDateString("ms-MY", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal("email", user)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="Tukar Emel"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openModal("password", user)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="Tukar Kata Laluan"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openModal("login", user)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Log Masuk Sebagai Pengguna"
                                                >
                                                    <LogIn size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openModal("delete", user)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                                                    title="Padam Pengguna"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {modal.type && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                        {/* Email Modal */}
                        {modal.type === "email" && (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-heading font-bold">Tukar Emel</h2>
                                    <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="form-label">Emel Baharu</Label>
                                        <Input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={closeModal} className="flex-1">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleUpdateEmail}
                                        disabled={actionLoading || !newEmail}
                                        className="flex-1 bg-black text-white hover:bg-zinc-800"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Simpan"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Password Modal */}
                        {modal.type === "password" && (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-heading font-bold">Tukar Kata Laluan</h2>
                                    <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Menetapkan kata laluan baharu untuk <strong>{modal.user?.email}</strong>
                                    </p>
                                    <div className="space-y-2">
                                        <Label className="form-label">Kata Laluan Baharu</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimum 6 aksara"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={closeModal} className="flex-1">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={actionLoading || newPassword.length < 6}
                                        className="flex-1 bg-black text-white hover:bg-zinc-800"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Simpan"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Delete Modal */}
                        {modal.type === "delete" && (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-heading font-bold text-red-600">Padam Pengguna</h2>
                                    <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <p className="text-sm text-red-700">
                                            Adakah anda pasti ingin memadam pengguna ini? Tindakan ini <strong>tidak boleh dibatalkan</strong>.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-600">Pengguna: <strong>{modal.user?.email}</strong></p>
                                        {modal.user?.mosque_name && (
                                            <p className="text-sm text-gray-600 mt-1">Masjid: <strong>{modal.user.mosque_name}</strong></p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={closeModal} className="flex-1">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleDeleteUser}
                                        disabled={actionLoading}
                                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Padam"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Login As Modal */}
                        {modal.type === "login" && (
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-heading font-bold">Log Masuk Sebagai Pengguna</h2>
                                    <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-700">
                                            Jana pautan log masuk untuk pengguna <strong>{modal.user?.email}</strong>. Apabila anda klik pautan tersebut, anda akan log masuk sebagai pengguna ini.
                                        </p>
                                    </div>
                                    {magicLink ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">Pautan Log Masuk:</p>
                                                <p className="text-sm font-mono text-gray-700 break-all">{magicLink}</p>
                                            </div>
                                            <a
                                                href={magicLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                <ExternalLink size={18} />
                                                Buka Pautan
                                            </a>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleGenerateLoginLink}
                                            disabled={actionLoading}
                                            className="w-full bg-black text-white hover:bg-zinc-800"
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <>
                                                    <LogIn size={18} className="mr-2" />
                                                    Jana Pautan Log Masuk
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={closeModal} className="w-full">
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
