import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEBHOOK_URL_PROD = "https://n8n.automation.lamanify.com/webhook/8965645c-73c1-4b5a-b4e1-cafdeb6ce3aa";
const WEBHOOK_URL_TEST = "https://n8n.automation.lamanify.com/webhook-test/8965645c-73c1-4b5a-b4e1-cafdeb6ce3aa";

serve(async (req) => {
    try {
        const { name, email, phone, mosqueName, isTest } = await req.json();

        const webhookUrl = isTest ? WEBHOOK_URL_TEST : WEBHOOK_URL_PROD;

        console.log(`Sending webhook to ${webhookUrl}`);
        console.log("Payload:", { name, email, phone, mosqueName });

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                mosqueName,
                source: "signup_hook",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Webhook failed:", response.status, errorText);
            return new Response(JSON.stringify({ error: `Webhook failed: ${response.status}`, details: errorText }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const responseData = await response.json().catch(() => ({ status: "ok" })); // Handle if n8n returns non-json

        return new Response(JSON.stringify(responseData), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error creating webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
});
