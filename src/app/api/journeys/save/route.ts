import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { saveJourneyToDb, getJourneyByIdFromDb } from '@/lib/dbServices';
import { savePhotoBuffer } from '@/lib/photoStorage';
import type { DisplacementJourney, Waypoint, WaypointPhoto } from '@/types';

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
        { error: 'Authentication required to save journey' },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const journeyRaw = formData.get('journey');

    if (!journeyRaw || typeof journeyRaw !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid journey metadata in FormData' },
        { status: 400 }
      );
    }

    let journey: DisplacementJourney;
    try {
      journey = JSON.parse(journeyRaw);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse journey JSON payload' },
        { status: 400 }
      );
    }

    // 3. Authorization check for editing
    const existing = await getJourneyByIdFromDb(journey.id);
    if (existing) {
      const isAdmin = isUserAdmin(user);
      const isAuthor = existing.authorId === user.id;
      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this journey' },
          { status: 403 }
        );
      }
    } else {
      // Set author details for new journey
      journey.authorId = user.id;
      journey.authorName = user.name || journey.authorName || 'Anonymous Voyager';
      journey.authorAvatar = user.image || journey.authorAvatar;
    }

    // 4. Process Multipart Photos for Each Waypoint from FormData
    const updatedWaypoints: Waypoint[] = await Promise.all(
      (journey.waypoints || []).map(async (waypoint, wIdx) => {
        const updatedPhotos: WaypointPhoto[] = await Promise.all(
          (waypoint.photos || []).map(async (photo, pIdx) => {
            const fileKey = `photo_${photo.id}`;
            const formEntry = formData.get(fileKey) || formData.get(photo.id);

            if (formEntry && typeof formEntry === 'object' && 'arrayBuffer' in formEntry) {
              const file = formEntry as File;
              const arrayBuf = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuf);
              const originalName = file.name || photo.filename || 'photo.jpg';

              const saved = await savePhotoBuffer(
                photo.id,
                buffer,
                originalName,
                file.type
              );

              return {
                ...photo,
                url: saved.url,
                filename: originalName,
                order: photo.order ?? pIdx + 1,
              };
            }

            return {
              ...photo,
              order: photo.order ?? pIdx + 1,
            };
          })
        );

        return {
          ...waypoint,
          order: waypoint.order ?? wIdx + 1,
          photos: updatedPhotos,
        };
      })
    );

    journey.waypoints = updatedWaypoints;

    // 5. Persist to Database
    const savedJourney = await saveJourneyToDb(journey);

    // 6. Revalidate Cache
    revalidatePath('/');
    revalidatePath(`/journey/${savedJourney.id}`);
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      journey: savedJourney,
    });
  } catch (error) {
    console.error('Error handling FormData journey save:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the journey.' },
      { status: 500 }
    );
  }
}
