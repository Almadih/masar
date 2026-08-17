import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { getAllJourneysFromDb, getPublicJourneysFromDb } from '@/lib/dbServices';
import { MainAppShell } from '@/components/MainAppShell';
import { Providers } from './providers';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialJourneys;

  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const isAdmin = isUserAdmin(session?.user);
    if (isAdmin) {
      initialJourneys = await getAllJourneysFromDb();
    } else {
      initialJourneys = await getPublicJourneysFromDb(session?.user?.id);
    }
  } catch (error) {
    console.error('Error fetching session in Home:', error);
    initialJourneys = await getPublicJourneysFromDb();
  }

  return (
    <Providers initialJourneys={initialJourneys}>
      <MainAppShell />
    </Providers>
  );
}
