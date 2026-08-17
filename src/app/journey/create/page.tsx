import React from 'react';
import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { JourneyFormPage } from '@/components/JourneyFormPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'وثّق مسار رحلتك • Share Your Journey | MASAR (مسار)',
  description:
    'ارفع صور رحلتك بالتسلسل الزمني، ورتّب المحطات، وشارك قصتك لتُحفظ في أرشيف الذاكرة الحية للسودان. Upload sequential photos and map your displacement route.',
};

export default function CreateJourneyPage() {
  return (
    <Providers>
      <JourneyFormPage mode="create" />
    </Providers>
  );
}
