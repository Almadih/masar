'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { JourneyProvider } from '@/context/JourneyContext';
import type { DisplacementJourney } from '@/types';

interface ProvidersProps {
  children: React.ReactNode;
  initialJourneys?: DisplacementJourney[];
}

export function Providers({ children, initialJourneys }: ProvidersProps) {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <JourneyProvider initialJourneys={initialJourneys}>
            {children}
          </JourneyProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
