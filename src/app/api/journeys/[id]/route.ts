import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin';
import { getJourneyByIdFromDb, deleteJourneyFromDb } from '@/lib/dbServices';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const journey = await getJourneyByIdFromDb(id);

    if (!journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    const isAccessible = journey.isPublic && journey.status === 'APPROVED';
    if (!isAccessible) {
      const reqHeaders = await headers();
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });

      const isAuthor = session?.user?.id && session.user.id === journey.authorId;
      const isAdmin = isUserAdmin(session?.user);

      if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
      }
    }

    return NextResponse.json(journey);
  } catch (error: any) {
    console.error('[API /api/journeys/[id] GET Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const { id } = await params;
    const journey = await getJourneyByIdFromDb(id);

    if (!journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    const isAuthor = session?.user?.id && session.user.id === journey.authorId;
    const isAdmin = isUserAdmin(session?.user);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const success = await deleteJourneyFromDb(id);
    if (success) {
      return NextResponse.json({ success: true, message: `Journey ${id} deleted` });
    } else {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('[API /api/journeys/[id] DELETE Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
