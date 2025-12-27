import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminContent } from "./SuperAdminContent";

export default async function SuperAdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is super admin
    const { data: admin } = await supabase
        .from("admins")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

    if (!admin?.is_super_admin) {
        redirect("/admin");
    }

    return <SuperAdminContent />;
}
