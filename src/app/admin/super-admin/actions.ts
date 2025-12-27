"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Verify caller is super admin
async function verifySuperAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: admin } = await supabase
        .from("admins")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

    return admin?.is_super_admin === true;
}

export interface UserWithMosque {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    mosque_name: string | null;
    mosque_slug: string | null;
}

export async function listAllUsers(): Promise<{ users: UserWithMosque[]; error?: string }> {
    if (!(await verifySuperAdmin())) {
        return { users: [], error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();

    // Get all auth users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (authError) {
        return { users: [], error: authError.message };
    }

    // Get admin records with mosque info
    const supabase = await createClient();
    const { data: adminsWithMosques } = await supabase
        .from("admins")
        .select(`
            id,
            mosques:mosque_id (
                name,
                slug
            )
        `);

    // Create a map for quick lookup
    const adminMosqueMap = new Map<string, { name: string | null; slug: string | null }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminsWithMosques?.forEach((admin: any) => {
        adminMosqueMap.set(admin.id, {
            name: admin.mosques?.name || null,
            slug: admin.mosques?.slug || null,
        });
    });

    // Combine auth users with mosque info
    const usersWithMosques: UserWithMosque[] = users.map(user => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        mosque_name: adminMosqueMap.get(user.id)?.name || null,
        mosque_slug: adminMosqueMap.get(user.id)?.slug || null,
    }));

    return { users: usersWithMosques };
}

export async function updateUserEmail(userId: string, newEmail: string): Promise<{ success: boolean; error?: string }> {
    if (!(await verifySuperAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: newEmail,
        email_confirm: true,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/super-admin");
    return { success: true };
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!(await verifySuperAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    if (newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!(await verifySuperAdmin())) {
        return { success: false, error: "Unauthorized" };
    }

    // Get current user to prevent self-deletion
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id === userId) {
        return { success: false, error: "Cannot delete your own account" };
    }

    const supabaseAdmin = createAdminClient();

    // Delete admin record first (foreign key constraint)
    await supabase.from("admins").delete().eq("id", userId);

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/super-admin");
    return { success: true };
}

export async function generateMagicLink(userId: string): Promise<{ link?: string; error?: string }> {
    if (!(await verifySuperAdmin())) {
        return { error: "Unauthorized" };
    }

    const supabaseAdmin = createAdminClient();

    // Get the user's email first
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !user?.email) {
        return { error: getUserError?.message || "User not found" };
    }

    // Generate magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: user.email,
    });

    if (error) {
        return { error: error.message };
    }

    return { link: data.properties.action_link };
}
