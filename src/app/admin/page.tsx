import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data: admin } = await supabase
        .from("admins")
        .select("mosque_id, name")
        .eq("id", user.id)
        .single();

    if (!admin?.mosque_id) {
        redirect("/onboarding");
    }

    // Fetch mosque data
    const { data: mosque } = await supabase
        .from("mosques")
        .select("*")
        .eq("id", admin.mosque_id)
        .single();

    if (!mosque) {
        redirect("/onboarding");
    }

    // Fetch stats
    const [
        { count: announcementCount },
        { count: eventCount },
        { count: committeeCount },
    ] = await Promise.all([
        supabase
            .from("announcements")
            .select("*", { count: "exact", head: true })
            .eq("mosque_id", admin.mosque_id)
            .eq("is_active", true),
        supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("mosque_id", admin.mosque_id)
            .eq("is_published", true),
        supabase
            .from("committee_members")
            .select("*", { count: "exact", head: true })
            .eq("mosque_id", admin.mosque_id),
    ]);

    // Fetch recent announcements
    const { data: recentAnnouncements } = await supabase
        .from("announcements")
        .select("id, title, created_at")
        .eq("mosque_id", admin.mosque_id)
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <DashboardContent
            mosque={mosque}
            adminName={admin.name || user.email?.split("@")[0] || "Admin"}
            stats={{
                announcements: announcementCount || 0,
                events: eventCount || 0,
                committee: committeeCount || 0,
            }}
            recentAnnouncements={recentAnnouncements || []}
        />
    );
}
