// Cloudinary Configuration and Upload Utilities

export const CLOUDINARY_CONFIG = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "debi0yfq9",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mosq_unsigned",
    maxFileSize: 2 * 1024 * 1024, // 2MB
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    error?: { message: string };
}

export interface CloudinaryUploadOptions {
    /**
     * Tenant folder name (mosque slug). If provided, uploads to /tenant/{tenantFolder}
     */
    tenantFolder?: string;
    /**
     * Custom subfolder within the tenant folder (e.g., 'aktiviti', 'pengumuman')
     */
    subfolder?: string;
    /**
     * Convert image to WebP format. Defaults to true for tenant uploads.
     */
    convertToWebP?: boolean;
}

/**
 * Convert an image file to WebP format using Canvas API
 */
async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert to WebP'));
                    }
                },
                'image/webp',
                quality
            );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

export async function uploadToCloudinary(
    file: File,
    options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> {
    const { tenantFolder, subfolder, convertToWebP: shouldConvertToWebP = !!tenantFolder } = options;

    // Validate file size
    if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
        throw new Error("Fail terlalu besar. Maksimum 2MB sahaja.");
    }

    // Validate file type
    if (!CLOUDINARY_CONFIG.acceptedTypes.includes(file.type)) {
        throw new Error("Format fail tidak disokong. Sila gunakan JPG, PNG, atau WebP.");
    }

    // Determine the upload folder
    let folder = "mosq";
    if (tenantFolder) {
        folder = `tenant/${tenantFolder}`;
        if (subfolder) {
            folder = `${folder}/${subfolder}`;
        }
    }

    // Convert to WebP if needed (and not already WebP)
    let uploadFile: File | Blob = file;
    let fileName = file.name;

    if (shouldConvertToWebP && file.type !== 'image/webp') {
        try {
            uploadFile = await convertToWebP(file);
            // Update filename to .webp extension
            fileName = file.name.replace(/\.[^/.]+$/, '.webp');
        } catch (error) {
            console.warn('WebP conversion failed, uploading original format:', error);
            // Continue with original file if conversion fails
        }
    }

    const formData = new FormData();
    formData.append("file", uploadFile, fileName);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data: CloudinaryUploadResponse = await response.json();

    if (data.error) {
        throw new Error(data.error.message || "Gagal memuat naik gambar.");
    }

    return data;
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: "auto" | "webp" | "jpg" | "png";
    } = {}
): string {
    if (!url || !url.includes("cloudinary.com")) {
        return url;
    }

    const { width, height, quality = 80, format = "auto" } = options;

    // Build transformation string
    const transforms: string[] = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);
    transforms.push("c_fill"); // Crop to fill

    const transformString = transforms.join(",");

    // Insert transformation into URL
    return url.replace("/upload/", `/upload/${transformString}/`);
}

// Preset image sizes for MOSQ
export const IMAGE_PRESETS = {
    logo: { width: 200, height: 200, quality: 90 },
    hero: { width: 1200, height: 600, quality: 85 },
    thumbnail: { width: 400, height: 300, quality: 80 },
    avatar: { width: 100, height: 100, quality: 90 },
    qrCode: { width: 400, height: 400, quality: 95 },
};
