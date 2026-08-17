import { prisma } from './prisma';
import type { DisplacementJourney } from '../types';
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
    photos: (j.photos || []).map((p: any) => ({
      id: p.id,
      journeyId: p.journeyId,
      url: p.url,
      filename: p.filename,
      latitude: p.latitude,
      longitude: p.longitude,
      locationName: p.locationName,
      timestamp: p.timestamp,
      caption: p.caption,
      notes: p.notes || undefined,
      hasExif: p.hasExif,
      order: p.orderIndex,
    })),
  };
}

export async function getAllJourneysFromDb(): Promise<DisplacementJourney[]> {
  const journeys = await prisma.journey.findMany({
    include: {
      photos: {
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
      photos: {
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
      photos: {
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

  // Process photos: If any photo has legacy base64 data, convert to file and update URL
  const processedPhotos = await Promise.all(
    (journey.photos || []).map(async (p, idx) => {
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
        order: p.order ?? idx + 1,
      };
    })
  );

  // Check for deleted photos during edit
  const existingPhotos = await prisma.photoPoint.findMany({
    where: { journeyId: journey.id },
    select: { id: true },
  });

  const incomingPhotoIds = new Set(processedPhotos.map((p) => p.id));
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

    // Delete existing photos in DB for this journey to perform a clean update
    await tx.photoPoint.deleteMany({
      where: { journeyId: journey.id },
    });

    // Create new photo points if provided
    if (processedPhotos.length > 0) {
      await tx.photoPoint.createMany({
        data: processedPhotos.map((p, idx) => ({
          id: p.id,
          journeyId: journey.id,
          url: p.url,
          filename: p.filename,
          latitude: p.latitude,
          longitude: p.longitude,
          locationName: p.locationName,
          timestamp: p.timestamp,
          caption: p.caption || '',
          notes: p.notes || null,
          hasExif: p.hasExif ?? true,
          orderIndex: p.order ?? idx + 1,
        })),
      });
    }
  });

  return {
    ...journey,
    photos: processedPhotos,
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
    const photos = await prisma.photoPoint.findMany({
      where: { journeyId: id },
      select: { id: true },
    });

    if (photos.length > 0) {
      await deletePhotoFiles(photos.map((p) => p.id));
    }

    // 2. Delete journey and cascade photo points in DB
    await prisma.journey.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Failed to delete journey from DB:', error);
    return false;
  }
}

/**
 * Migration helper: Scans the database for legacy base64 image strings,
 * writes them as binary files in storage/photos/, and updates PhotoPoint.url to /api/photos/<id>.
 */
export async function migrateDatabaseBase64Photos(): Promise<{ migratedCount: number }> {
  try {
    const base64Photos = await prisma.photoPoint.findMany({
      where: {
        url: {
          startsWith: 'data:',
        },
      },
    });

    let migratedCount = 0;
    for (const photo of base64Photos) {
      try {
        const saved = await saveBase64Photo(photo.id, photo.url, photo.filename);
        await prisma.photoPoint.update({
          where: { id: photo.id },
          data: { url: saved.url },
        });
        migratedCount++;
      } catch (err) {
        console.error(`Failed to migrate base64 photo ${photo.id}:`, err);
      }
    }

    return { migratedCount };
  } catch (error) {
    console.error('Error migrating base64 photos:', error);
    return { migratedCount: 0 };
  }
}


