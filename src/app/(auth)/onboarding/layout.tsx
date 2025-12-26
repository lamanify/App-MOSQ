import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sediakan Laman Web Masjid - MOSQ",
    description: "Lengkapkan maklumat masjid untuk mencipta laman web profesional",
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {children}
            </div>
        </div>
    );
}
