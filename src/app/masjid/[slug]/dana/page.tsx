import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicHeader } from "../_components/PublicHeader";
import { PublicFooter } from "../_components/PublicFooter";
import { BrandColorProvider } from "../_components/BrandColorProvider";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function DanaPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: mosque } = await supabase
        .from("mosques")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!mosque) {
        notFound();
    }

    return (
        <BrandColorProvider brandColor={mosque.brand_color} className="bg-white">
            <PublicHeader mosque={mosque} />

            <main className="pt-24 min-h-screen">
                {/* Hero section */}
                <section className="relative h-[400px] md:h-[500px] flex items-center bg-brand/5 overflow-hidden border-b border-brand/10">
                    <div className="absolute inset-0 w-full h-full opacity-[0.07]">
                        <img
                            src="https://res.cloudinary.com/debi0yfq9/image/upload/v1766630810/APP_1_vti8y3.webp"
                            alt=""
                            className="w-full h-full object-cover"
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
