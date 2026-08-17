import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'photos');

/**
 * Ensures the physical storage directory exists on disk.
 */
export async function ensureStorageDir(): Promise<string> {
  if (!existsSync(STORAGE_DIR)) {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
  return STORAGE_DIR;
}

/**
 * Maps common image MIME types to standard file extensions.
 */
export function getExtensionFromMime(mimeType?: string | null): string {
  if (!mimeType) return 'jpg';
  const cleanMime = mimeType.toLowerCase().trim();
  switch (cleanMime) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/avif':
      return 'avif';
    case 'image/heic':
      return 'heic';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'jpg';
  }
}

/**
 * Maps file extension to HTTP Content-Type MIME header.
 */
export function getMimeFromExtension(ext: string): string {
  const cleanExt = ext.replace(/^\./, '').toLowerCase().trim();
  switch (cleanExt) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'heic':
      return 'image/heic';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Saves binary photo buffer to server filesystem in storage/photos/<photoId>.<ext>.
 * Returns the protected route handler URL (/api/photos/<photoId>).
 */
export async function savePhotoBuffer(
  photoId: string,
  buffer: Buffer | Uint8Array,
  originalFilename?: string,
  mimeType?: string
): Promise<{ url: string; filename: string; filePath: string }> {
  await ensureStorageDir();

  // Determine file extension
  let ext = 'jpg';
  if (originalFilename && originalFilename.includes('.')) {
    const extractedExt = path.extname(originalFilename).replace('.', '').toLowerCase();
    if (extractedExt && extractedExt.length <= 5) {
      ext = extractedExt;
    }
  } else if (mimeType) {
    ext = getExtensionFromMime(mimeType);
  }

  // Remove existing file variations for this photoId before saving
  await deletePhotoFile(photoId);

  const safeFilename = `${photoId}.${ext}`;
  const filePath = path.join(STORAGE_DIR, safeFilename);

  await fs.writeFile(filePath, Buffer.from(buffer));

  return {
    url: `/api/photos/${photoId}`,
    filename: safeFilename,
    filePath,
  };
}

/**
 * Decodes and saves a Base64 data URL to the filesystem.
 */
export async function saveBase64Photo(
  photoId: string,
  base64String: string,
  originalFilename?: string
): Promise<{ url: string; filename: string; filePath: string }> {
  let mimeType = 'image/jpeg';
  let data = base64String;

  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    data = match[2];
  }

  const buffer = Buffer.from(data, 'base64');
  return savePhotoBuffer(photoId, buffer, originalFilename, mimeType);
}

/**
 * Locates and reads a photo file from disk by photoId.
 */
export async function getPhotoFile(photoId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filePath: string;
} | null> {
  await ensureStorageDir();

  try {
    const files = await fs.readdir(STORAGE_DIR);
    // Find file starting with photoId + "." (e.g. photo-101.jpg, photo-101.png)
    const matchingFile = files.find((f) => {
      const parsed = path.parse(f);
      return parsed.name === photoId || f === photoId;
    });

    if (!matchingFile) {
      return null;
    }

    const filePath = path.join(STORAGE_DIR, matchingFile);
    const ext = path.extname(matchingFile);
    const mimeType = getMimeFromExtension(ext);
    const buffer = await fs.readFile(filePath);

    return {
      buffer,
      mimeType,
      filePath,
    };
  } catch (error) {
    console.error(`Error reading photo file for ${photoId}:`, error);
    return null;
  }
}

/**
 * Deletes any existing file for a given photoId.
 */
export async function deletePhotoFile(photoId: string): Promise<void> {
  if (!existsSync(STORAGE_DIR)) return;

  try {
    const files = await fs.readdir(STORAGE_DIR);
    const matchingFiles = files.filter((f) => {
      const parsed = path.parse(f);
      return parsed.name === photoId || f === photoId;
    });

    for (const file of matchingFiles) {
      const fullPath = path.join(STORAGE_DIR, file);
      await fs.unlink(fullPath).catch(() => {});
    }
  } catch (error) {
    console.error(`Error deleting photo file for ${photoId}:`, error);
  }
}

/**
 * Bulk deletes photo files for multiple photoIds.
 */
export async function deletePhotoFiles(photoIds: string[]): Promise<void> {
  await Promise.all(photoIds.map((id) => deletePhotoFile(id)));
}
