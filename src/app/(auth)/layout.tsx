import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Log Masuk - MOSQ",
    description: "Log masuk ke akaun MOSQ anda",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
