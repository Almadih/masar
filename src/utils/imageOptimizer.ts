/**
 * Client-Side Image Optimizer
 * Resizes and compresses high-resolution photographs directly in the browser
 * to avoid serverless payload limits (e.g. Vercel 4.5MB limit) and speed up uploads.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.82,
  mimeType: 'image/jpeg',
};

/**
 * Compresses a single File object in the browser using HTML5 Canvas.
 * Returns the optimized File, or the original File if compression is skipped/fails.
 */
export async function compressImage(
  file: File,
  options?: ImageOptimizationOptions
): Promise<File> {
  // Only process standard browser-supported image MIME types
  if (!file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVGs or animated GIFs
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If the file is already small (e.g. < 250KB), compression is unnecessary
  if (file.size < 250 * 1024) {
    return file;
  }

  const { maxWidth, maxHeight, quality, mimeType } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return new Promise((resolve) => {
    // Graceful fallback for non-browser / SSR environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          return resolve(file);
        }

        // Calculate aspect-ratio-preserved bounding box
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Only use compressed blob if it actually reduced the size
            if (blob.size >= file.size) {
              return resolve(file);
            }

            // Construct new file with original filename or appropriate extension
            let newName = file.name;
            const ext = mimeType === 'image/webp' ? '.webp' : '.jpg';
            if (!newName.toLowerCase().endsWith(ext)) {
              newName = newName.replace(/\.[^/.]+$/, '') + ext;
            }

            const optimizedFile = new File([blob], newName, {
              type: mimeType,
              lastModified: file.lastModified || Date.now(),
            });

            resolve(optimizedFile);
          },
          mimeType,
          quality
        );
      } catch (err) {
        console.warn('Canvas image compression failed, falling back to original file:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn('Failed to load image for compression, using original file.');
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Optimizes a batch of images concurrently with optional progress callbacks.
 */
export async function compressBatchImages(
  files: File[],
  options?: ImageOptimizationOptions,
  concurrency = 3,
  onProgress?: (processed: number, total: number) => void
): Promise<File[]> {
  const results: File[] = new Array(files.length);
  let currentIndex = 0;
  let processedCount = 0;

  async function worker() {
    while (currentIndex < files.length) {
      const idx = currentIndex++;
      const file = files[idx];
      results[idx] = await compressImage(file, options);
      processedCount++;
      if (onProgress) {
        onProgress(processedCount, files.length);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}
