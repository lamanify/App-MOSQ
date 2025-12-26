"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadToCloudinary, CLOUDINARY_CONFIG, CloudinaryUploadOptions } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    aspectRatio?: "square" | "wide" | "auto";
    className?: string;
    /**
     * Tenant folder name (mosque slug). When provided, images are converted to WebP
     * and uploaded to /tenant/{tenantFolder}/{subfolder}
     */
    tenantFolder?: string;
    /**
     * Subfolder within the tenant folder (e.g., 'aktiviti', 'pengumuman')
     */
    subfolder?: string;
}

export function ImageUpload({
    value,
    onChange,
    label = "Muat Naik Gambar",
    aspectRatio = "auto",
    className = "",
    tenantFolder,
    subfolder,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const aspectRatioClass = {
        square: "aspect-square",
        wide: "aspect-video",
        auto: "aspect-auto min-h-[150px]",
    }[aspectRatio];

    async function handleUpload(file: File) {
        setUploading(true);
        try {
            // Build upload options for tenant-specific WebP conversion
            const uploadOptions: CloudinaryUploadOptions = {};
            if (tenantFolder) {
                uploadOptions.tenantFolder = tenantFolder;
                uploadOptions.subfolder = subfolder;
                uploadOptions.convertToWebP = true;
            }

            const result = await uploadToCloudinary(file, uploadOptions);
            onChange(result.secure_url);

            // Show success message with format info
            const formatInfo = tenantFolder ? " (WebP)" : "";
            toast.success(`Gambar berjaya dimuat naik${formatInfo}!`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal memuat naik gambar");
        } finally {
            setUploading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && CLOUDINARY_CONFIG.acceptedTypes.includes(file.type)) {
            handleUpload(file);
        } else {
            toast.error("Format fail tidak disokong");
        }
    }

    function handleRemove() {
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept={CLOUDINARY_CONFIG.acceptedTypes.join(",")}
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
            />

            {value ? (
                <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${aspectRatioClass}`}>
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors tap-target"
                        aria-label="Padam gambar"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
            relative rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-200 flex flex-col items-center justify-center
            ${aspectRatioClass} min-h-[150px]
            ${dragActive
                            ? "border-black bg-gray-50/50"
                            : "border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100/50"
                        }
          `}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={32} className="animate-spin text-black" />
                            <span className="text-sm text-gray-600 font-medium">Sedang memuat naik...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 p-6 text-center">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <ImageIcon size={24} className="text-black" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">{label}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    JPG, PNG, atau WebP (Maks 2MB)
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    inputRef.current?.click();
                                }}
                            >
                                <Upload size={16} className="mr-2" />
                                Pilih Fail
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
