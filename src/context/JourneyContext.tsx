'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DisplacementJourney, PhotoPoint } from '../types';
import { getStoredJourneys, saveJourney as persistJourney, deleteJourney as removeJourney } from '../utils/storage';
import { saveJourneyAction, deleteJourneyAction, toggleJourneyVisibilityAction } from '@/app/actions';

interface JourneyContextType {
  journeys: DisplacementJourney[];
  setJourneys: React.Dispatch<React.SetStateAction<DisplacementJourney[]>>;
  selectedJourney: DisplacementJourney | null;
  setSelectedJourney: (journey: DisplacementJourney | null) => void;
  selectedPhoto: PhotoPoint | null;
  setSelectedPhoto: (photo: PhotoPoint | null) => void;
  activePhotoIndex: number;
  setActivePhotoIndex: (index: number) => void;
  saveNewOrUpdatedJourney: (
    journey: DisplacementJourney,
    photoFiles?: Map<string, File> | Record<string, File>
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
  const [journeys, setJourneys] = useState<DisplacementJourney[]>(() => {
    if (initialJourneys && initialJourneys.length > 0) {
      return initialJourneys;
    }
    return getStoredJourneys();
  });
  const [selectedJourney, setSelectedJourney] = useState<DisplacementJourney | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoPoint | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Synchronize state if initialJourneys updates
  useEffect(() => {
    if (initialJourneys && initialJourneys.length > 0) {
      setJourneys(initialJourneys);
    }
  }, [initialJourneys]);

  // Sync selected journey photo index
  useEffect(() => {
    if (selectedJourney && selectedJourney.photos.length > 0) {
      if (!selectedPhoto || selectedPhoto.journeyId !== selectedJourney.id) {
        setSelectedPhoto(selectedJourney.photos[0]);
        setActivePhotoIndex(0);
      }
    }
  }, [selectedJourney]);

  const saveNewOrUpdatedJourney = async (
    journey: DisplacementJourney,
    photoFiles?: Map<string, File> | Record<string, File>
  ): Promise<DisplacementJourney> => {
    const hasFiles =
      photoFiles &&
      (photoFiles instanceof Map ? photoFiles.size > 0 : Object.keys(photoFiles).length > 0);

    if (hasFiles) {
      const formData = new FormData();
      formData.append('journey', JSON.stringify(journey));

      if (photoFiles instanceof Map) {
        photoFiles.forEach((file, photoId) => {
          formData.append(`photo_${photoId}`, file, file.name);
        });
      } else {
        Object.entries(photoFiles).forEach(([photoId, file]) => {
          formData.append(`photo_${photoId}`, file, file.name);
        });
      }

      const response = await fetch('/api/journeys/save', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save journey');
      }

      const data = await response.json();
      const savedJourney: DisplacementJourney = data.journey;

      const updated = persistJourney(savedJourney);
      setJourneys(updated);
      if (selectedJourney?.id === savedJourney.id) {
        setSelectedJourney(savedJourney);
      }

      return savedJourney;
    }

    try {
      const saved = await saveJourneyAction(journey);
      const updated = persistJourney(saved);
      setJourneys(updated);
      if (selectedJourney?.id === saved.id) {
        setSelectedJourney(saved);
      }
      return saved;
    } catch (err) {
      console.error('Failed to save journey via server action:', err);
      const updated = persistJourney(journey);
      setJourneys(updated);
      return journey;
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
    // Local storage & optimistic UI update
    const updated = removeJourney(id);
    setJourneys(updated);
    if (selectedJourney?.id === id) {
      setSelectedJourney(null);
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
