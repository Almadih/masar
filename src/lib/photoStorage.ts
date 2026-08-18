import {
  uploadToR2,
  getFromR2,
  deleteFromR2,
  deleteManyFromR2,
} from './r2';

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
 * Generates the canonical storage object key for Cloudflare R2.
 */
export function getR2Key(photoId: string, ext: string = 'jpg'): string {
  return `photos/${photoId}.${ext}`;
}

/**
 * Saves binary photo buffer directly to Cloudflare R2 bucket.
 * Returns the protected route handler URL (/api/photos/<photoId>).
 */
export async function savePhotoBuffer(
  photoId: string,
  buffer: Buffer | Uint8Array,
  originalFilename?: string,
  mimeType?: string
): Promise<{ url: string; filename: string; key: string }> {
  // Determine file extension
  let ext = 'jpg';
  if (originalFilename && originalFilename.includes('.')) {
    const parts = originalFilename.split('.');
    const extractedExt = parts[parts.length - 1].toLowerCase();
    if (extractedExt && extractedExt.length <= 5) {
      ext = extractedExt;
    }
  } else if (mimeType) {
    ext = getExtensionFromMime(mimeType);
  }

  const safeFilename = `${photoId}.${ext}`;
  const r2Key = getR2Key(photoId, ext);
  const resolvedMime = mimeType || getMimeFromExtension(ext);
  const nodeBuffer = Buffer.from(buffer);

  await uploadToR2(r2Key, nodeBuffer, resolvedMime);

  return {
    url: `/api/photos/${photoId}`,
    filename: safeFilename,
    key: r2Key,
  };
}

/**
 * Decodes and saves a Base64 data URL to Cloudflare R2.
 */
export async function saveBase64Photo(
  photoId: string,
  base64String: string,
  originalFilename?: string
): Promise<{ url: string; filename: string; key: string }> {
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
 * Locates and reads a photo file directly from Cloudflare R2 bucket.
 */
export async function getPhotoFile(photoId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'svg'];

  for (const ext of possibleExtensions) {
    const r2Key = getR2Key(photoId, ext);
    const r2Result = await getFromR2(r2Key);
    if (r2Result) {
      return {
        buffer: r2Result.buffer,
        mimeType: r2Result.contentType || getMimeFromExtension(ext),
      };
    }
  }

  return null;
}

/**
 * Deletes a photo from Cloudflare R2.
 */
export async function deletePhotoFile(photoId: string): Promise<void> {
  const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'svg'];
  for (const ext of possibleExtensions) {
    await deleteFromR2(getR2Key(photoId, ext));
  }
}

/**
 * Bulk deletes photos from Cloudflare R2.
 */
export async function deletePhotoFiles(photoIds: string[]): Promise<void> {
  if (!photoIds || photoIds.length === 0) return;

  const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic'];
  const r2Keys: string[] = [];

  for (const photoId of photoIds) {
    for (const ext of possibleExtensions) {
      r2Keys.push(getR2Key(photoId, ext));
    }
  }

  await deleteManyFromR2(r2Keys);
}
