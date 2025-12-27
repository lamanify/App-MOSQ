// Server component for brand color injection


import { ReactNode } from "react";

interface BrandColorProviderProps {
    brandColor?: string | null;
    children: ReactNode;
    className?: string;
}

export function BrandColorProvider({
    brandColor,
    children,
    className = ""
}: BrandColorProviderProps) {
    const color = brandColor || "#4F46E5";

    // Generate a slightly darker color for hover states
    const adjustColorBrightness = (hex: string, percent: number): string => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    };

    const brandColorDark = adjustColorBrightness(color, -15);
    const brandColorLight = adjustColorBrightness(color, 40);

    return (
        <div
            className={`min-h-screen ${className}`}
            style={{
                '--brand-color': color,
                '--brand-color-dark': brandColorDark,
                '--brand-color-light': brandColorLight,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}
