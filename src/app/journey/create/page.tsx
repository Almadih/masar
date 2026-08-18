import React from 'react';
import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { JourneyFormPage } from '@/components/JourneyFormPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'وثّق مسار رحلتك • Share Your Journey',
  description:
    'ارفع صور رحلتك بالتسلسل الزمني، ورتّب المحطات، وشارك قصتك لتُحفظ في أرشيف الذاكرة الحية للسودان. Upload sequential photos and map your displacement route.',
  openGraph: {
    title: 'وثّق مسار رحلتك • Share Your Journey | MASAR (مسار)',
    description:
      'ارفع صور رحلتك بالتسلسل الزمني، ورتّب المحطات، وشارك قصتك لتُحفظ في أرشيف الذاكرة الحية للسودان.',
    images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'MASAR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وثّق مسار رحلتك • Share Your Journey | MASAR (مسار)',
    description:
      'ارفع صور رحلتك بالتسلسل الزمني، ورتّب المحطات، وشارك قصتك لتُحفظ في أرشيف الذاكرة الحية للسودان.',
    images: ['/logo.jpg'],
  },
};

export default function CreateJourneyPage() {
  return (
    <Providers>
      <JourneyFormPage mode="create" />
    </Providers>
  );
}
