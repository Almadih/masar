import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { canAccessJourney } from '@/lib/accessControl';
import { getJourneyByIdFromDb } from '@/lib/dbServices';
import { Providers } from '@/app/providers';
import { JourneyDetailPage } from '@/components/JourneyDetailPage';

export const dynamic = 'force-dynamic';

interface JourneyPageProps {
  params: Promise<{ id: string }>;
}

async function isJourneyAccessible(journey: { isPublic: boolean; status?: string; authorId?: string }): Promise<boolean> {
  if (journey.isPublic && journey.status === 'APPROVED') {
    return true;
  }

  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    return canAccessJourney(journey, session?.user);
  } catch (error) {
    console.error('Error verifying user session for journey access:', error);
  }

  return false;
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const journey = await getJourneyByIdFromDb(resolvedParams.id);

  if (!journey) {
    return {
      title: 'Journey Not Found | MASAR (مسار)',
      description: 'The requested displacement journey could not be found on MASAR.',
    };
  }

  const accessible = await isJourneyAccessible(journey);
  if (!accessible) {
    return {
      title: 'Journey Not Found | MASAR (مسار)',
      description: 'The requested displacement journey could not be found on MASAR.',
    };
  }

  const coverPhoto = journey.waypoints?.find((w) => w.photos && w.photos.length > 0)?.photos?.[0];
  const imageUrl = coverPhoto?.url || '/logo.jpg';
  const pageTitle = `${journey.title} | MASAR (مسار)`;
  const description = `${journey.summary.slice(0, 160)} — من ${journey.startLocation} إلى ${journey.destination} (${journey.distanceKm} كم).`;

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      type: 'article',
      url: `/journey/${journey.id}`,
      siteName: 'MASAR (مسار)',
      locale: 'ar_SD',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: journey.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: JourneyPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const journey = await getJourneyByIdFromDb(resolvedParams.id);

  if (!journey) {
    notFound();
  }

  const accessible = await isJourneyAccessible(journey);
  if (!accessible) {
    notFound();
  }

  return (
    <Providers initialJourneys={[journey]}>
      <JourneyDetailPage journey={journey} />
    </Providers>
  );
}
