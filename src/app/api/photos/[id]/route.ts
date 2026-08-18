import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/dbServices';
import { auth } from '@/lib/auth';
import { canAccessJourney } from '@/lib/accessControl';
import { getPhotoFile } from '@/lib/photoStorage';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: photoId } = await context.params;

    if (!photoId) {
      return new NextResponse('Photo ID is required', { status: 400 });
    }

    // 1. Look up photo record in the database
    const photo = await prisma.waypointPhoto.findUnique({
      where: { id: photoId },
      include: {
        waypoint: {
          include: {
            journey: {
              select: {
                id: true,
                isPublic: true,
                status: true,
                authorId: true,
              },
            },
          },
        },
      },
    });

    const journey = photo?.waypoint?.journey;

    if (!photo || !journey) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    // 2. Perform Authorization Check for Private / Flagged / Pending journeys
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const isAllowed = canAccessJourney(journey, session?.user);

    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied: this photo belongs to a private or unapproved journey.' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 3. Retrieve photo file from physical disk storage
    const fileResult = await getPhotoFile(photoId);

    if (!fileResult) {
      // If photo was an external URL (e.g. sample seed data)
      if (photo.url && (photo.url.startsWith('http://') || photo.url.startsWith('https://'))) {
        return NextResponse.redirect(photo.url);
      }

      return new NextResponse('Image file missing from storage', { status: 404 });
    }

    // 4. Set appropriate cache headers
    const isPublicApproved = journey.isPublic && journey.status === 'APPROVED';
    const cacheControl = isPublicApproved
      ? 'public, max-age=86400, stale-while-revalidate=3600'
      : 'private, no-cache, no-store, must-revalidate';

    return new NextResponse(new Uint8Array(fileResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': fileResult.mimeType,
        'Content-Length': fileResult.buffer.length.toString(),
        'Cache-Control': cacheControl,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
