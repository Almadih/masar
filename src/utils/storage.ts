import type { DisplacementJourney, User } from '../types';
import { SAMPLE_JOURNEYS } from './sampleData';

const JOURNEYS_KEY = 'masar_displacement_journeys_v1';
const USER_KEY = 'masar_current_user_v1';

export function getStoredJourneys(): DisplacementJourney[] {
  if (typeof window === 'undefined') return SAMPLE_JOURNEYS;
  try {
    const raw = localStorage.getItem(JOURNEYS_KEY);
    if (!raw) {
      localStorage.setItem(JOURNEYS_KEY, JSON.stringify(SAMPLE_JOURNEYS));
      return SAMPLE_JOURNEYS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_JOURNEYS;
  } catch (e) {
    console.error('Failed to load journeys from localStorage:', e);
    return SAMPLE_JOURNEYS;
  }
}

export function saveJourney(journey: DisplacementJourney): DisplacementJourney[] {
  const journeys = getStoredJourneys();
  const index = journeys.findIndex(j => j.id === journey.id);
  
  let updated: DisplacementJourney[];
  if (index >= 0) {
    updated = [...journeys];
    updated[index] = journey;
  } else {
    updated = [journey, ...journeys];
  }
  
  try {
    localStorage.setItem(JOURNEYS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save journey to localStorage:', e);
  }
  return updated;
}

export function deleteJourney(journeyId: string): DisplacementJourney[] {
  const journeys = getStoredJourneys();
  const updated = journeys.filter(j => j.id !== journeyId);
  try {
    localStorage.setItem(JOURNEYS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete journey:', e);
  }
  return updated;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return null;
}

export function saveStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}
