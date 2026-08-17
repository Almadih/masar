import type { User } from '../types';

const USER_KEY = 'masar_current_user_v1';

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
