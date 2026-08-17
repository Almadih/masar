import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { getAllJourneysFromDb, getPublicJourneysFromDb, saveJourneyToDb } from '@/lib/dbServices';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const isAdmin = isUserAdmin(session?.user);
    const journeys = isAdmin
      ? await getAllJourneysFromDb()
      : await getPublicJourneysFromDb(session?.user?.id);

    return NextResponse.json(journeys);
  } catch (error: any) {
    console.error('[API /api/journeys GET Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await saveJourneyToDb(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/journeys POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to save journey', details: error.message },
      { status: 400 }
    );
  }
}
