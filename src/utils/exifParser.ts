import exifr from 'exifr';

export interface ExtractedMetadata {
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  hasExifLocation: boolean;
  hasExifTime: boolean;
}

export async function extractPhotoMetadata(file: File): Promise<ExtractedMetadata> {
  try {
    const output = await exifr.parse(file, [
      'latitude',
      'longitude',
      'DateTimeOriginal',
      'CreateDate',
      'ModifyDate'
    ]);

    let latitude: number | null = null;
    let longitude: number | null = null;
    let timestamp: string | null = null;

    if (output) {
      if (typeof output.latitude === 'number' && typeof output.longitude === 'number') {
        latitude = output.latitude;
        longitude = output.longitude;
      }

      const dateObj = output.DateTimeOriginal || output.CreateDate || output.ModifyDate;
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        timestamp = dateObj.toISOString().slice(0, 16).replace('T', ' ');
      }
    }

    if (latitude === null || longitude === null) {
      try {
        const gps = await exifr.gps(file);
        if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
          latitude = gps.latitude;
          longitude = gps.longitude;
        }
      } catch (e) {
        // Ignore fallback error
      }
    }

    return {
      latitude,
      longitude,
      timestamp,
      hasExifLocation: latitude !== null && longitude !== null,
      hasExifTime: timestamp !== null,
    };
  } catch (error) {
    console.warn('Error reading EXIF data from file:', error);
    return {
      latitude: null,
      longitude: null,
      timestamp: null,
      hasExifLocation: false,
      hasExifTime: false,
    };
  }
}

export async function extractBatchPhotoMetadata(
  files: File[],
  concurrency = 4,
  onProgress?: (processed: number, total: number) => void
): Promise<ExtractedMetadata[]> {
  const results: ExtractedMetadata[] = new Array(files.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < files.length) {
      const idx = currentIndex++;
      const file = files[idx];
      results[idx] = await extractPhotoMetadata(file);
      if (onProgress) {
        onProgress(idx + 1, files.length);
      }
      // Yield to the browser rendering loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}

