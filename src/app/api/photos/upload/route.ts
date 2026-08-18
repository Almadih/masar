import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { savePhotoBuffer } from '@/lib/photoStorage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const user = session?.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to upload photos.' },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const fileEntry = formData.get('file') || formData.get('photo');
    const photoIdRaw = formData.get('photoId') || formData.get('id');

    if (!fileEntry || typeof fileEntry !== 'object' || !('arrayBuffer' in fileEntry)) {
      return NextResponse.json(
        { error: 'No valid image file provided in upload request.' },
        { status: 400 }
      );
    }

    const file = fileEntry as File;
    const photoId = typeof photoIdRaw === 'string' && photoIdRaw.trim()
      ? photoIdRaw.trim()
      : `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // 3. Process Binary Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = file.name || `${photoId}.jpg`;

    // 4. Save to physical disk storage
    const saved = await savePhotoBuffer(
      photoId,
      buffer,
      originalName,
      file.type
    );

    return NextResponse.json({
      success: true,
      photoId,
      url: saved.url,
      filename: saved.filename,
    });
  } catch (error) {
    console.error('Error handling single photo upload:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the photo.' },
      { status: 500 }
    );
  }
}
