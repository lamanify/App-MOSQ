export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type AnnouncementCategory =
    | "umum"
    | "aktiviti"
    | "kewangan"
    | "waktu_solat"
    | "lain_lain";

export interface Database {
    public: {
        Tables: {
            mosques: {
                Row: {
                    id: string;
                    slug: string;
                    name: string;
                    tagline: string | null;
                    address: string | null;
                    state: string | null;
                    zone_code: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    logo_url: string | null;
                    hero_image_url: string | null;
                    about_text: string | null;
                    phone: string | null;
                    email: string | null;
                    whatsapp_link: string | null;
                    facebook_url: string | null;
                    instagram_url: string | null;
                    telegram_url: string | null;
                    tiktok_url: string | null;
                    youtube_url: string | null;
                    bank_name: string | null;
                    bank_account_name: string | null;
                    bank_account_number: string | null;
                    donation_qr_url: string | null;
                    brand_color: string | null;
                    google_maps_name: string | null;
                    is_published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    slug: string;
                    name: string;
                    tagline?: string | null;
                    address?: string | null;
                    state?: string | null;
                    zone_code?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    logo_url?: string | null;
                    hero_image_url?: string | null;
                    about_text?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    whatsapp_link?: string | null;
                    facebook_url?: string | null;
                    instagram_url?: string | null;
                    telegram_url?: string | null;
                    tiktok_url?: string | null;
                    youtube_url?: string | null;
                    bank_name?: string | null;
                    bank_account_name?: string | null;
                    bank_account_number?: string | null;
                    donation_qr_url?: string | null;
                    brand_color?: string | null;
                    google_maps_name?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    slug?: string;
                    name?: string;
                    tagline?: string | null;
                    address?: string | null;
                    state?: string | null;
                    zone_code?: string | null;
                    latitude?: number | null;
                    longitude?: number | null;
                    logo_url?: string | null;
                    hero_image_url?: string | null;
                    about_text?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    whatsapp_link?: string | null;
                    facebook_url?: string | null;
                    instagram_url?: string | null;
                    telegram_url?: string | null;
                    tiktok_url?: string | null;
                    youtube_url?: string | null;
                    bank_name?: string | null;
                    bank_account_name?: string | null;
                    bank_account_number?: string | null;
                    donation_qr_url?: string | null;
                    brand_color?: string | null;
                    google_maps_name?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            admins: {
                Row: {
                    id: string;
                    mosque_id: string | null;
                    name: string | null;
                    email: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    mosque_id?: string | null;
                    name?: string | null;
                    email?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    mosque_id?: string | null;
                    name?: string | null;
                    email?: string | null;
                    created_at?: string;
                };
            };
            committee_members: {
                Row: {
                    id: string;
                    mosque_id: string;
                    name: string;
                    role: string;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    mosque_id: string;
                    name: string;
                    role: string;
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    mosque_id?: string;
                    name?: string;
                    role?: string;
                    display_order?: number;
                    created_at?: string;
                    slug?: string | null;
                };
            };
            announcements: {
                Row: {
                    id: string;
                    mosque_id: string;
                    title: string;
                    content: string;
                    category: AnnouncementCategory;
                    publish_date: string;
                    expiry_date: string | null;
                    is_active: boolean;
                    created_at: string;
                    slug: string | null;
                };
                Insert: {
                    id?: string;
                    mosque_id: string;
                    title: string;
                    content: string;
                    category?: AnnouncementCategory;
                    publish_date?: string;
                    expiry_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    slug?: string | null;
                };
                Update: {
                    id?: string;
                    mosque_id?: string;
                    title?: string;
                    content?: string;
                    category?: AnnouncementCategory;
                    publish_date?: string;
                    expiry_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    slug?: string | null;
                };
            };
            events: {
                Row: {
                    id: string;
                    mosque_id: string;
                    title: string;
                    description: string | null;
                    event_date: string;
                    event_time: string | null;
                    location: string | null;
                    speaker: string | null;
                    featured_image_url: string | null;
                    is_published: boolean;
                    created_at: string;
                    slug: string | null;
                };
                Insert: {
                    id?: string;
                    mosque_id: string;
                    title: string;
                    description?: string | null;
                    event_date: string;
                    event_time?: string | null;
                    location?: string | null;
                    speaker?: string | null;
                    featured_image_url?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    slug?: string | null;
                };
                Update: {
                    id?: string;
                    mosque_id?: string;
                    title?: string;
                    description?: string | null;
                    event_date?: string;
                    event_time?: string | null;
                    location?: string | null;
                    speaker?: string | null;
                    featured_image_url?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    slug?: string | null;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            announcement_category: AnnouncementCategory;
        };
    };
}

// Helper types
export type Mosque = Database["public"]["Tables"]["mosques"]["Row"];
export type MosqueInsert = Database["public"]["Tables"]["mosques"]["Insert"];
export type MosqueUpdate = Database["public"]["Tables"]["mosques"]["Update"];

export type Admin = Database["public"]["Tables"]["admins"]["Row"];
export type AdminInsert = Database["public"]["Tables"]["admins"]["Insert"];

export type CommitteeMember = Database["public"]["Tables"]["committee_members"]["Row"];
export type CommitteeMemberInsert = Database["public"]["Tables"]["committee_members"]["Insert"];
export type CommitteeMemberUpdate = Database["public"]["Tables"]["committee_members"]["Update"];

export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];
export type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"];

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
