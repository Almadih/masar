'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DisplacementJourney, Waypoint, WaypointPhoto } from '../types';
import { saveJourneyAction, deleteJourneyAction, toggleJourneyVisibilityAction } from '@/app/actions';
import { compressImage } from '@/utils/imageOptimizer';

export interface SaveJourneyProgress {
  stage: 'compressing' | 'uploading' | 'saving';
  current: number;
  total: number;
}

interface JourneyContextType {
  journeys: DisplacementJourney[];
  setJourneys: React.Dispatch<React.SetStateAction<DisplacementJourney[]>>;
  selectedJourney: DisplacementJourney | null;
  setSelectedJourney: (journey: DisplacementJourney | null) => void;
  selectedWaypoint: Waypoint | null;
  setSelectedWaypoint: (waypoint: Waypoint | null) => void;
  activeWaypointIndex: number;
  setActiveWaypointIndex: (index: number) => void;
  selectedPhoto: WaypointPhoto | null;
  setSelectedPhoto: (photo: WaypointPhoto | null) => void;
  activePhotoIndex: number;
  setActivePhotoIndex: (index: number) => void;
  saveNewOrUpdatedJourney: (
    journey: DisplacementJourney,
    photoFiles?: Map<string, File> | Record<string, File>,
    onProgress?: (progress: SaveJourneyProgress) => void
  ) => Promise<DisplacementJourney>;
  deleteJourneyById: (id: string) => Promise<void>;
  toggleJourneyVisibility: (id: string, isPublic: boolean) => Promise<boolean>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

interface JourneyProviderProps {
  children: React.ReactNode;
  initialJourneys?: DisplacementJourney[];
}

export const JourneyProvider: React.FC<JourneyProviderProps> = ({ children, initialJourneys }) => {
  const [journeys, setJourneys] = useState<DisplacementJourney[]>(initialJourneys || []);
  const [selectedJourney, setSelectedJourney] = useState<DisplacementJourney | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<WaypointPhoto | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Synchronize state if initialJourneys updates
  useEffect(() => {
    if (initialJourneys && initialJourneys.length > 0) {
      setJourneys(initialJourneys);
    }
  }, [initialJourneys]);

  // Fetch journeys from API if not provided via SSR props
  useEffect(() => {
    if (!initialJourneys || initialJourneys.length === 0) {
      let isMounted = true;
      fetch('/api/journeys')
        .then(res => (res.ok ? res.json() : []))
        .then((data: DisplacementJourney[]) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setJourneys(data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch journeys from API:', err);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [initialJourneys]);

  // Sync selected journey waypoint and photo
  useEffect(() => {
    if (selectedJourney && selectedJourney.waypoints && selectedJourney.waypoints.length > 0) {
      if (!selectedWaypoint || selectedWaypoint.journeyId !== selectedJourney.id) {
        const firstWp = selectedJourney.waypoints[0];
        setSelectedWaypoint(firstWp);
        setActiveWaypointIndex(0);
        if (firstWp.photos && firstWp.photos.length > 0) {
          setSelectedPhoto(firstWp.photos[0]);
          setActivePhotoIndex(0);
        } else {
          setSelectedPhoto(null);
          setActivePhotoIndex(0);
        }
      }
    } else {
      setSelectedWaypoint(null);
      setSelectedPhoto(null);
    }
  }, [selectedJourney]);

  const updateInMemoryJourneys = (saved: DisplacementJourney) => {
    setJourneys(prev => {
      const idx = prev.findIndex(j => j.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    if (selectedJourney?.id === saved.id) {
      setSelectedJourney(saved);
    }
  };

  const saveNewOrUpdatedJourney = async (
    journey: DisplacementJourney,
    photoFiles?: Map<string, File> | Record<string, File>,
    onProgress?: (progress: SaveJourneyProgress) => void
  ): Promise<DisplacementJourney> => {
    // 1. Collect pending files
    const pendingEntries: Array<{ photoId: string; file: File }> = [];
    if (photoFiles) {
      if (photoFiles instanceof Map) {
        photoFiles.forEach((file, photoId) => {
          pendingEntries.push({ photoId, file });
        });
      } else {
        Object.entries(photoFiles).forEach(([photoId, file]) => {
          pendingEntries.push({ photoId, file });
        });
      }
    }

    const totalFiles = pendingEntries.length;

    // 2. If there are binary image files to upload, compress and upload individually
    if (totalFiles > 0) {
      // Stage A: Client-side image compression
      onProgress?.({ stage: 'compressing', current: 0, total: totalFiles });
      const compressedEntries: Array<{ photoId: string; file: File }> = [];

      for (let i = 0; i < pendingEntries.length; i++) {
        const { photoId, file } = pendingEntries[i];
        const optimized = await compressImage(file);
        compressedEntries.push({ photoId, file: optimized });
        onProgress?.({ stage: 'compressing', current: i + 1, total: totalFiles });
      }

      // Stage B: Concurrent individual uploads to /api/photos/upload
      onProgress?.({ stage: 'uploading', current: 0, total: totalFiles });
      let uploadedCount = 0;
      const concurrency = 3;
      let currentIndex = 0;

      async function uploadWorker() {
        while (currentIndex < compressedEntries.length) {
          const itemIdx = currentIndex++;
          const { photoId, file } = compressedEntries[itemIdx];

          const formData = new FormData();
          formData.append('photoId', photoId);
          formData.append('file', file, file.name);

          let res = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData,
          });

          // Single retry on transient failure
          if (!res.ok) {
            res = await fetch('/api/photos/upload', {
              method: 'POST',
              body: formData,
            });
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to upload photo (${file.name})`);
          }

          uploadedCount++;
          onProgress?.({ stage: 'uploading', current: uploadedCount, total: totalFiles });
        }
      }

      const workers = Array.from(
        { length: Math.min(concurrency, compressedEntries.length) },
        () => uploadWorker()
      );

      await Promise.all(workers);
    }

    // 3. Stage C: Persist journey metadata cleanly via Server Action
    onProgress?.({ stage: 'saving', current: 0, total: 1 });

    // Ensure all waypoint photos point to the standardized /api/photos/[id] route
    const sanitizedJourney: DisplacementJourney = {
      ...journey,
      waypoints: (journey.waypoints || []).map(wp => ({
        ...wp,
        photos: (wp.photos || []).map(photo => ({
          ...photo,
          url: photo.url?.startsWith('data:') || photo.url?.startsWith('blob:')
            ? `/api/photos/${photo.id}`
            : photo.url || `/api/photos/${photo.id}`,
        })),
      })),
    };

    try {
      const saved = await saveJourneyAction(sanitizedJourney);
      onProgress?.({ stage: 'saving', current: 1, total: 1 });
      updateInMemoryJourneys(saved);
      return saved;
    } catch (err) {
      console.error('Failed to persist journey metadata via server action:', err);
      throw err;
    }
  };

  const toggleJourneyVisibility = async (id: string, isPublic: boolean): Promise<boolean> => {
    // Optimistic UI update
    setJourneys(prev =>
      prev.map(j => (j.id === id ? { ...j, isPublic } : j))
    );
    if (selectedJourney?.id === id) {
      setSelectedJourney(prev => (prev ? { ...prev, isPublic } : null));
    }

    try {
      return await toggleJourneyVisibilityAction(id, isPublic);
    } catch (err) {
      console.error('Server Action failed to toggle visibility:', err);
      return false;
    }
  };

  const deleteJourneyById = async (id: string) => {
    // In-memory optimistic UI update
    setJourneys(prev => prev.filter(j => j.id !== id));
    if (selectedJourney?.id === id) {
      setSelectedJourney(null);
      setSelectedWaypoint(null);
      setSelectedPhoto(null);
    }

    try {
      // Execute Next.js Server Action
      await deleteJourneyAction(id);
    } catch (err) {
      console.error('Server Action failed to delete journey:', err);
    }
  };

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        setJourneys,
        selectedJourney,
        setSelectedJourney,
        selectedWaypoint,
        setSelectedWaypoint,
        activeWaypointIndex,
        setActiveWaypointIndex,
        selectedPhoto,
        setSelectedPhoto,
        activePhotoIndex,
        setActivePhotoIndex,
        saveNewOrUpdatedJourney,
        deleteJourneyById,
        toggleJourneyVisibility,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
