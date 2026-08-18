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

export interface WaypointPhoto {
  id: string;
  waypointId?: string;
  url: string;
  filename: string;
  caption?: string;
  notes?: string;
  order?: number;
}

export interface Waypoint {
  id: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string; // ISO string or format "YYYY-MM-DD HH:mm"
  title?: string;
  description?: string;
  order: number;
  photos: WaypointPhoto[];
  hasExif?: boolean;
}

// Type alias for compatibility if needed during transitions
export type PhotoPoint = Waypoint;

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
  waypoints: Waypoint[];
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
