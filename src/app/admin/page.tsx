import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { getAllJourneysFromDb } from '@/lib/dbServices';
import { AdminPageClient } from './AdminPageClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user) {
    redirect('/?auth_required=true&redirect=/admin');
  }

  if (!isUserAdmin(session.user)) {
    redirect('/?unauthorized=true');
  }

  const initialJourneys = await getAllJourneysFromDb();

  return <AdminPageClient initialJourneys={initialJourneys} user={session.user} />;
}
