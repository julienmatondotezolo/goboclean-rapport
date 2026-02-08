import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

/**
 * Compresses an image file to reduce size for upload
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    const compressionOptions = { ...defaultOptions, ...options };
    
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Preserve original filename
    const newFile = new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
    
    return newFile;
  } catch (error) {
    throw new Error('Échec de la compression de l\'image');
  }
}

/**
 * Compresses multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return await Promise.all(compressionPromises);
}

/**
 * Creates a preview URL for an image file
 * @param file - The image file
 * @returns Preview URL
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free memory
 * @param url - The preview URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validates image file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns True if file size is valid
 */
export function validateImageSize(file: File, maxSizeMB: number = 10): boolean {
  const fileSizeMB = file.size / 1024 / 1024;
  return fileSizeMB <= maxSizeMB;
}
