import { prisma } from './prisma';
import type { DisplacementJourney, Waypoint, WaypointPhoto } from '../types';
import { deletePhotoFiles, saveBase64Photo } from './photoStorage';

export { prisma };

function mapJourney(j: any): DisplacementJourney {
  return {
    id: j.id,
    title: j.title,
    summary: j.summary,
    authorName: j.authorName,
    authorId: j.authorId,
    authorAvatar: j.authorAvatar || undefined,
    startLocation: j.startLocation,
    destination: j.destination,
    startDate: j.startDate,
    endDate: j.endDate || undefined,
    distanceKm: j.distanceKm,
    createdAt: j.createdAt,
    isPublic: j.isPublic,
    status: (j.status as 'APPROVED' | 'PENDING' | 'FLAGGED') || 'APPROVED',
    tags: JSON.parse(j.tags || '[]'),
    familyMembersCount: j.familyMembersCount,
    waypoints: (j.waypoints || []).map((w: any) => ({
      id: w.id,
      journeyId: w.journeyId,
      latitude: w.latitude,
      longitude: w.longitude,
      locationName: w.locationName,
      timestamp: w.timestamp,
      title: w.title || undefined,
      description: w.description || undefined,
      order: w.orderIndex,
      photos: (w.photos || []).map((p: any) => ({
        id: p.id,
        waypointId: p.waypointId,
        url: p.url,
        filename: p.filename,
        caption: p.caption || undefined,
        notes: p.notes || undefined,
        order: p.orderIndex,
      })),
    })),
  };
}

export async function getAllJourneysFromDb(): Promise<DisplacementJourney[]> {
  const journeys = await prisma.journey.findMany({
    include: {
      waypoints: {
        include: {
          photos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return journeys.map(mapJourney);
}

export async function getPublicJourneysFromDb(authorId?: string): Promise<DisplacementJourney[]> {
  const journeys = await prisma.journey.findMany({
    where: authorId
      ? {
          OR: [
            { isPublic: true, status: 'APPROVED' },
            { authorId },
          ],
        }
      : {
          isPublic: true,
          status: 'APPROVED',
        },
    include: {
      waypoints: {
        include: {
          photos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return journeys.map(mapJourney);
}

export async function getJourneyByIdFromDb(id: string): Promise<DisplacementJourney | null> {
  const j = await prisma.journey.findUnique({
    where: { id },
    include: {
      waypoints: {
        include: {
          photos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  });

  if (!j) return null;

  return mapJourney(j);
}

export async function saveJourneyToDb(journey: DisplacementJourney): Promise<DisplacementJourney> {
  const tagsJson = JSON.stringify(journey.tags || []);

  // Process photos in each waypoint (save base64 if needed)
  const processedWaypoints: Waypoint[] = await Promise.all(
    (journey.waypoints || []).map(async (w, wIdx) => {
      const processedPhotos: WaypointPhoto[] = await Promise.all(
        (w.photos || []).map(async (p, pIdx) => {
          let finalUrl = p.url;
          if (p.url && p.url.startsWith('data:')) {
            try {
              const saved = await saveBase64Photo(p.id, p.url, p.filename);
              finalUrl = saved.url;
            } catch (err) {
              console.error(`Failed to save base64 photo ${p.id} to disk:`, err);
            }
          }
          return {
            ...p,
            url: finalUrl,
            order: p.order ?? pIdx + 1,
          };
        })
      );

      return {
        ...w,
        order: w.order ?? wIdx + 1,
        photos: processedPhotos,
      };
    })
  );

  // Check for deleted photos during edit
  const existingPhotos = await prisma.waypointPhoto.findMany({
    where: {
      waypoint: {
        journeyId: journey.id,
      },
    },
    select: { id: true },
  });

  const incomingPhotoIds = new Set(
    processedWaypoints.flatMap((w) => w.photos.map((p) => p.id))
  );

  const removedPhotoIds = existingPhotos
    .filter((p) => !incomingPhotoIds.has(p.id))
    .map((p) => p.id);

  if (removedPhotoIds.length > 0) {
    await deletePhotoFiles(removedPhotoIds);
  }

  await prisma.$transaction(async (tx) => {
    // Upsert journey record
    await tx.journey.upsert({
      where: { id: journey.id },
      create: {
        id: journey.id,
        title: journey.title,
        summary: journey.summary,
        authorName: journey.authorName,
        authorId: journey.authorId,
        authorAvatar: journey.authorAvatar || null,
        startLocation: journey.startLocation,
        destination: journey.destination,
        startDate: journey.startDate,
        endDate: journey.endDate || null,
        distanceKm: journey.distanceKm || 0,
        createdAt: journey.createdAt,
        isPublic: journey.isPublic ?? true,
        status: journey.status || 'APPROVED',
        tags: tagsJson,
        familyMembersCount: journey.familyMembersCount || 1,
      },
      update: {
        title: journey.title,
        summary: journey.summary,
        authorName: journey.authorName,
        authorId: journey.authorId,
        authorAvatar: journey.authorAvatar || null,
        startLocation: journey.startLocation,
        destination: journey.destination,
        startDate: journey.startDate,
        endDate: journey.endDate || null,
        distanceKm: journey.distanceKm || 0,
        createdAt: journey.createdAt,
        isPublic: journey.isPublic ?? true,
        status: journey.status || 'APPROVED',
        tags: tagsJson,
        familyMembersCount: journey.familyMembersCount || 1,
      },
    });

    // Delete existing waypoints (cascades to photos)
    await tx.waypoint.deleteMany({
      where: { journeyId: journey.id },
    });

    // Create new waypoints and nested photos
    for (const w of processedWaypoints) {
      await tx.waypoint.create({
        data: {
          id: w.id,
          journeyId: journey.id,
          latitude: w.latitude,
          longitude: w.longitude,
          locationName: w.locationName,
          timestamp: w.timestamp,
          title: w.title || '',
          description: w.description || null,
          orderIndex: w.order,
          photos: {
            create: w.photos.map((p, pIdx) => ({
              id: p.id,
              url: p.url,
              filename: p.filename,
              caption: p.caption || '',
              notes: p.notes || null,
              orderIndex: p.order ?? pIdx + 1,
            })),
          },
        },
      });
    }
  });

  return {
    ...journey,
    waypoints: processedWaypoints,
  };
}

export async function toggleJourneyVisibilityInDb(id: string, isPublic: boolean): Promise<boolean> {
  try {
    await prisma.journey.update({
      where: { id },
      data: { isPublic },
    });
    return true;
  } catch (error) {
    console.error('Failed to toggle journey visibility:', error);
    return false;
  }
}

export async function updateJourneyStatusInDb(id: string, status: 'APPROVED' | 'PENDING' | 'FLAGGED'): Promise<boolean> {
  try {
    await prisma.journey.update({
      where: { id },
      data: { status },
    });
    return true;
  } catch (error) {
    console.error('Failed to update journey status:', error);
    return false;
  }
}

export async function deleteJourneyFromDb(id: string): Promise<boolean> {
  try {
    // 1. Delete associated physical photo files from disk
    const photos = await prisma.waypointPhoto.findMany({
      where: {
        waypoint: {
          journeyId: id,
        },
      },
      select: { id: true },
    });

    if (photos.length > 0) {
      await deletePhotoFiles(photos.map((p) => p.id));
    }

    // 2. Delete journey (cascades to waypoints and photos in DB)
    await prisma.journey.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Failed to delete journey from DB:', error);
    return false;
  }
}
