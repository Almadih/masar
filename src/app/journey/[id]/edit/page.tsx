import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { getJourneyByIdFromDb } from '@/lib/dbServices';
import { Providers } from '@/app/providers';
import { JourneyFormPage } from '@/components/JourneyFormPage';

export const dynamic = 'force-dynamic';

interface EditJourneyPageProps {
  params: Promise<{ id: string }>;
}

async function canEditJourney(journey: { authorId?: string }): Promise<boolean> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) return false;
    if (isUserAdmin(session.user)) return true;
    if (journey.authorId && session.user.id === journey.authorId) return true;
  } catch (error) {
    console.error('Error verifying permissions for journey edit:', error);
  }

  return false;
}

export async function generateMetadata({ params }: EditJourneyPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const journey = await getJourneyByIdFromDb(resolvedParams.id);

  if (!journey) {
    return {
      title: 'Journey Not Found | MASAR (مسار)',
      description: 'The requested journey could not be found.',
    };
  }

  return {
    title: `تعديل: ${journey.title} | MASAR (مسار)`,
    description: `Edit milestones, photos, and route details for ${journey.title}.`,
  };
}

export default async function EditJourneyPage({ params }: EditJourneyPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const journey = await getJourneyByIdFromDb(resolvedParams.id);

  if (!journey) {
    notFound();
  }

  const allowed = await canEditJourney(journey);
  if (!allowed) {
    notFound();
  }

  return (
    <Providers initialJourneys={[journey]}>
      <JourneyFormPage mode="edit" initialJourney={journey} />
    </Providers>
  );
}
