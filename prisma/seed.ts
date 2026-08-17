import { PrismaClient } from '@prisma/client';
import { SAMPLE_JOURNEYS } from '../src/utils/sampleData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with initial Sudanese displacement journeys and Admin user...');

  // Seed Admin Accounts dynamically from ADMIN_EMAILS env variable
  const adminEmailsEnv =
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    'admin@masar-sudan.org';
  const adminEmails = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  for (let i = 0; i < adminEmails.length; i++) {
    const adminEmail = adminEmails[i];
    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        id: `admin-${i + 1}`,
        email: adminEmail,
        name: 'MASAR Platform Moderator (Admin)',
        role: 'ADMIN',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      update: {
        role: 'ADMIN',
      },
    });
  }

  for (const journey of SAMPLE_JOURNEYS) {
    const tagsJson = JSON.stringify(journey.tags || []);

    await prisma.journey.upsert({
      where: { id: journey.id },
      create: {
        id: journey.id,
        title: journey.title,
        summary: journey.summary,
        authorName: journey.authorName,
        authorId: journey.authorId,
        authorAvatar: journey.authorAvatar || null,
        startLocation: journey.startLocation,
        destination: journey.destination,
        startDate: journey.startDate,
        endDate: journey.endDate || null,
        distanceKm: journey.distanceKm || 0,
        createdAt: journey.createdAt,
        isPublic: journey.isPublic ?? true,
        status: journey.status || 'APPROVED',
        tags: tagsJson,
        familyMembersCount: journey.familyMembersCount || 1,
      },
      update: {
        title: journey.title,
        summary: journey.summary,
        authorName: journey.authorName,
        authorId: journey.authorId,
        authorAvatar: journey.authorAvatar || null,
        startLocation: journey.startLocation,
        destination: journey.destination,
        startDate: journey.startDate,
        endDate: journey.endDate || null,
        distanceKm: journey.distanceKm || 0,
        createdAt: journey.createdAt,
        isPublic: journey.isPublic ?? true,
        status: journey.status || 'APPROVED',
        tags: tagsJson,
        familyMembersCount: journey.familyMembersCount || 1,
      },
    });

    await prisma.photoPoint.deleteMany({
      where: { journeyId: journey.id },
    });

    if (journey.photos && journey.photos.length > 0) {
      await prisma.photoPoint.createMany({
        data: journey.photos.map((p, idx) => ({
          id: p.id,
          journeyId: journey.id,
          url: p.url,
          filename: p.filename,
          latitude: p.latitude,
          longitude: p.longitude,
          locationName: p.locationName,
          timestamp: p.timestamp,
          caption: p.caption || '',
          notes: p.notes || null,
          hasExif: p.hasExif ?? true,
          orderIndex: p.order ?? idx + 1,
        })),
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
