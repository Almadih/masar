import { isUserAdmin } from './admin';

export interface JourneyAccessContext {
  isPublic: boolean;
  status?: string | null;
  authorId?: string | null;
}

export interface UserSessionContext {
  id?: string | null;
  role?: string | null;
  email?: string | null;
}

/**
 * Checks if a user has permission to view a journey and its associated media assets.
 * 
 * Rules:
 * 1. Public & APPROVED journeys are viewable by anyone (including anonymous guests).
 * 2. Private, FLAGGED, or PENDING journeys are strictly accessible ONLY to:
 *    - The original journey author (user.id === journey.authorId)
 *    - A platform administrator (isUserAdmin(user) === true)
 */
export function canAccessJourney(
  journey: JourneyAccessContext,
  user?: UserSessionContext | null
): boolean {
  // Public, approved journeys are visible to everyone
  if (journey.isPublic && journey.status === 'APPROVED') {
    return true;
  }

  if (!user) {
    return false;
  }

  // Administrators have global access for moderation and review
  if (isUserAdmin(user)) {
    return true;
  }

  // Authors can always access and preview their own journeys regardless of status
  if (journey.authorId && user.id && journey.authorId === user.id) {
    return true;
  }

  return false;
}

/**
 * Checks if a user has permission to edit or delete a journey.
 */
export function canEditJourney(
  journey: { authorId?: string | null },
  user?: UserSessionContext | null
): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  if (journey.authorId && user.id && journey.authorId === user.id) return true;
  return false;
}
