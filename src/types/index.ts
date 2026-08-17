export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  googleId?: string;
  isGuest?: boolean;
  isAnonymous?: boolean;
  role?: 'USER' | 'ADMIN';
  isAdmin?: boolean;
}

export interface PhotoPoint {
  id: string;
  journeyId: string;
  url: string;
  filename: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string; // ISO string or format "YYYY-MM-DD HH:mm"
  caption: string;
  notes?: string;
  hasExif: boolean;
  order: number;
}

export interface DisplacementJourney {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  summary: string;
  startLocation: string;
  destination: string;
  startDate: string;
  endDate?: string;
  photos: PhotoPoint[];
  distanceKm: number;
  createdAt: string;
  isPublic: boolean;
  status?: 'APPROVED' | 'PENDING' | 'FLAGGED';
  tags: string[];
  familyMembersCount?: number;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
