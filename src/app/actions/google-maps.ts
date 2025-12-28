"use server";

export async function resolveGoogleMapsLink(shortUrl: string) {
    try {
        if (!shortUrl.includes("maps.app.goo.gl")) {
            return shortUrl;
        }

        const response = await fetch(shortUrl, {
            method: "HEAD",
            redirect: "manual",
        });

        const location = response.headers.get("location");
        return location || shortUrl;
    } catch (error) {
        console.error("Error resolving Google Maps link:", error);
        return shortUrl;
    }
}
