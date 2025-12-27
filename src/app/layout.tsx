import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Default MOSQ branding for SEO
const DEFAULT_FAVICON = "https://res.cloudinary.com/debi0yfq9/image/upload/v1766797441/Mosq_Logo_2_tv21jw.jpg";
const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/debi0yfq9/image/upload/v1766797543/APP_MOSQ_-_Image_slioua.jpg";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "MOSQ - Bina Laman Web Masjid Percuma",
  description: "Platform pembina laman web masjid percuma untuk semua masjid di Malaysia. Mudah, cepat, dan profesional.",
  keywords: ["masjid", "laman web masjid", "MOSQ", "waktu solat", "Malaysia"],
  // Default icons (favicon)
  icons: {
    icon: [
      { url: DEFAULT_FAVICON, type: "image/jpeg" },
    ],
    shortcut: DEFAULT_FAVICON,
    apple: DEFAULT_FAVICON,
  },
  // Open Graph for social sharing
  openGraph: {
    type: "website",
    siteName: "MOSQ",
    title: "MOSQ - Bina Laman Web Masjid Percuma",
    description: "Platform pembina laman web masjid percuma untuk semua masjid di Malaysia. Mudah, cepat, dan profesional.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "MOSQ - Platform Laman Web Masjid",
      },
    ],
  },
  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "MOSQ - Bina Laman Web Masjid Percuma",
    description: "Platform pembina laman web masjid percuma untuk semua masjid di Malaysia.",
    images: [DEFAULT_OG_IMAGE],
  },
  // Additional metadata
  applicationName: "MOSQ",
  creator: "MOSQ",
  publisher: "MOSQ",
  metadataBase: new URL("https://mosq.io"),
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
