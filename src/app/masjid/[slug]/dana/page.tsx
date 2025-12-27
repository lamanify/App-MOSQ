import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "../_components/PublicHeader";
import { PublicFooter } from "../_components/PublicFooter";
import { BrandColorProvider } from "../_components/BrandColorProvider";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";
import { generateWebPageSchema } from "@/lib/structuredData";
import { constructTenantMetadata } from "@/lib/seo";
import { getCachedMosqueBySlug, getCachedMosqueMetadata } from "@/lib/cache";

interface Props {
    params: Promise<{ slug: string }>;
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const mosque = await getCachedMosqueMetadata(slug);

    if (!mosque) {
        return { title: "Masjid Tidak Dijumpai" };
    }

    return constructTenantMetadata({
        mosque,
        slug,
        path: "/dana",
        title: `Infak & Sumbangan | ${mosque.name}`,
        description: mosque.about_text?.slice(0, 160) || mosque.tagline || `Sumbangan anda membantu mengimarahkan ${mosque.name} dan membiayai aktiviti dakwah komuniti.`,
    });
}

export default async function DanaPage({ params }: Props) {
    const { slug } = await params;

    // Use cached mosque data
    const mosque = await getCachedMosqueBySlug(slug);

    if (!mosque) {
        notFound();
    }

    // Generate Structured Data
    const jsonLd = generateWebPageSchema(mosque, {
        name: `Infak & Sumbangan ${mosque.name}`,
        description: `Sumbangan anda membantu mengimarahkan ${mosque.name} dan membiayai aktiviti dakwah komuniti.`,
        path: "/dana"
    });

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-white">
            <StructuredData data={jsonLd} />
            <PublicHeader mosque={mosque} />

            <main className="pt-24 min-h-screen">
                {/* Hero section */}
                <section className="relative h-[400px] md:h-[500px] flex items-center bg-brand/5 overflow-hidden border-b border-brand/10">
                    <div className="absolute inset-0 w-full h-full opacity-[0.07]">
                        <Image
                            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 mb-10 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Utama
                        </Link>

                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                                Dana & Infak
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heading font-black text-gray-900 mb-6 tracking-tight">
                                Saham Akhirat
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
                                Sumbangan anda membantu mengimarahkan <span className="font-bold text-gray-900">{mosque.name}</span> dan membiayai aktiviti dakwah komuniti.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-3xl font-heading font-black text-gray-900 mb-6">Saluran Sumbangan</h2>
                                    {mosque.bank_name ? (
                                        <div className="bg-white border border-brand/20 rounded-[2rem] p-8 md:p-12 shadow-sm">
                                            <p className="text-sm text-brand-light font-bold uppercase tracking-widest mb-4">Akaun Bank</p>
                                            <p className="text-3xl font-bold text-gray-900 mb-2">{mosque.bank_name}</p>
                                            <p className="text-4xl md:text-5xl font-mono text-brand tracking-tight font-black mb-6">
                                                {mosque.bank_account_number}
                                            </p>
                                            {mosque.bank_account_name && (
                                                <div className="pt-6 border-t border-gray-200">
                                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Nama Akaun</p>
                                                    <p className="text-lg font-bold text-gray-900">{mosque.bank_account_name}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Maklumat perbankan belum dikemaskini.</p>
                                    )}
                                </div>

                                <div className="bg-brand/5 rounded-[2rem] p-8 border border-brand/10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Kenapa Berinfaq?</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Setiap ringgit yang anda sumbangkan akan digunakan untuk penyelenggaraan masjid,
                                        program pendidikan, bantuan kebajikan, dan aktiviti kemasyarakatan.
                                        Semoga ianya menjadi amal jariah yang berterusan.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center lg:items-end">
                                {mosque.donation_qr_url && (
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand/10 w-full max-w-sm sticky top-32">
                                        <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-8 border-2 border-dashed border-brand/20 flex items-center justify-center p-4">
                                            <Image
                                                src={mosque.donation_qr_url}
                                                alt="QR DuitNow"
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-900 font-black text-2xl mb-1">Imbas DuitNow QR</p>
                                            <p className="text-gray-500">Terima kasih atas sumbangan ikhlas anda</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter mosque={mosque} />
        </BrandColorProvider>
    );
}
