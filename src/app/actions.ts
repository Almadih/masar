'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import {
  saveJourneyToDb,
  deleteJourneyFromDb,
  toggleJourneyVisibilityInDb,
  updateJourneyStatusInDb,
  getJourneyByIdFromDb,
} from '@/lib/dbServices';
import type { DisplacementJourney } from '@/types';

async function getAuthUser() {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    return session?.user || null;
  } catch {
    return null;
  }
}

export async function saveJourneyAction(journey: DisplacementJourney): Promise<DisplacementJourney> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required to save journey');
  }

  const existing = await getJourneyByIdFromDb(journey.id);
  if (existing) {
    const isAdmin = isUserAdmin(user);
    const isAuthor = existing.authorId === user.id;
    if (!isAdmin && !isAuthor) {
      throw new Error('You do not have permission to edit this journey');
    }
  } else {
    // If new journey, ensure author details match current user
    journey.authorId = user.id;
    journey.authorName = user.name || journey.authorName || 'Anonymous Voyager';
    journey.authorAvatar = user.image || journey.authorAvatar;
  }

  const saved = await saveJourneyToDb(journey);
  revalidatePath('/');
  revalidatePath(`/journey/${journey.id}`);
  revalidatePath('/admin');
  return saved;
}

export async function toggleJourneyVisibilityAction(id: string, isPublic: boolean): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const journey = await getJourneyByIdFromDb(id);
  if (!journey) {
    throw new Error('Journey not found');
  }

  const isAdmin = isUserAdmin(user);
  const isAuthor = journey.authorId === user.id;
  if (!isAdmin && !isAuthor) {
    throw new Error('You do not have permission to change visibility of this journey');
  }

  const success = await toggleJourneyVisibilityInDb(id, isPublic);
  revalidatePath('/');
  revalidatePath(`/journey/${id}`);
  revalidatePath('/admin');
  return success;
}

export async function updateJourneyStatusAction(
  id: string,
  status: 'APPROVED' | 'PENDING' | 'FLAGGED'
): Promise<boolean> {
  const user = await getAuthUser();
  if (!user || !isUserAdmin(user)) {
    throw new Error('Admin authorization required');
  }

  const success = await updateJourneyStatusInDb(id, status);
  revalidatePath('/');
  revalidatePath(`/journey/${id}`);
  revalidatePath('/admin');
  return success;
}

export async function deleteJourneyAction(id: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const journey = await getJourneyByIdFromDb(id);
  if (!journey) {
    throw new Error('Journey not found');
  }

  const isAdmin = isUserAdmin(user);
  const isAuthor = journey.authorId === user.id;
  if (!isAdmin && !isAuthor) {
    throw new Error('You do not have permission to delete this journey');
  }

  const success = await deleteJourneyFromDb(id);
  revalidatePath('/');
  revalidatePath(`/journey/${id}`);
  revalidatePath('/admin');
  return success;
}
