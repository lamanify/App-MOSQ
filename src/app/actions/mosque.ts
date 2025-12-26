"use server";

import { revalidatePath } from "next/cache";

export async function revalidateMosqueData(slug: string) {
    if (!slug) return;

    // Revalidate the public mosque pages
    revalidatePath(`/masjid/${slug}`);
    revalidatePath(`/masjid/${slug}/pengumuman`);
    revalidatePath(`/masjid/${slug}/aktiviti`);
    revalidatePath(`/masjid/${slug}/ajk`);
    revalidatePath(`/masjid/${slug}/dana`);

    // Also revalidate wildcard subdomain if applicable (though revalidatePath might not work across domains easily)
    // But since we are using rewrites, /masjid/[slug] is the internal path.
}
