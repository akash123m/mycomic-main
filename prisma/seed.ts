import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding MyComic database...");

  // 1. Initial Admin Account
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@mycomic.com";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "adminpassword123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user created/updated: ${admin.email}`);

  const authorPasswordHash = await bcrypt.hash("akash@123", 12);
  const arialtia = await db.user.upsert({
    where: { email: "arialtia@mycomic.local" },
    update: { username: "arialtia", name: "Arialtia", passwordHash: authorPasswordHash, role: "AUTHOR", isSuspended: false, mustChangePassword: false },
    create: { username: "arialtia", email: "arialtia@mycomic.local", name: "Arialtia", passwordHash: authorPasswordHash, role: "AUTHOR", mustChangePassword: false },
  });
  console.log("✓ Author account created/updated: arialtia");

  // 2. Default Genres
  const defaultGenres = [
    { name: "Fantasy", icon: "🗡️" },
    { name: "Action", icon: "💥" },
    { name: "Romance", icon: "💕" },
    { name: "Horror", icon: "👻" },
    { name: "Sci-Fi", icon: "🚀" },
    { name: "Comedy", icon: "😂" },
    { name: "Drama", icon: "🎭" },
    { name: "Thriller", icon: "🔪" },
    { name: "Mystery", icon: "🔍" },
    { name: "Slice of Life", icon: "☕" },
    { name: "Adventure", icon: "🧭" },
    { name: "Supernatural", icon: "🌙" },
    { name: "Psychological", icon: "🧠" },
    { name: "Historical", icon: "🏯" },
    { name: "Martial Arts", icon: "🥋" },
    { name: "School Life", icon: "🎒" },
    { name: "Sports", icon: "🏆" },
    { name: "Isekai", icon: "🌀" },
    { name: "Mecha", icon: "🤖" },
    { name: "Crime", icon: "🕵️" },
    { name: "Post-Apocalyptic", icon: "🏚️" },
    { name: "Survival", icon: "🔥" },
  ];

  for (const genre of defaultGenres) {
    await db.genre.upsert({
      where: { name: genre.name },
      update: { icon: genre.icon },
      create: genre,
    });
  }
  console.log(`✓ Default genres seeded (${defaultGenres.length})`);

  // 3. Default Site Settings
  await db.siteSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      primaryColor: "#9dfb2b",
      secondaryColor: "#da009d",
      tertiaryColor: "#079ea8",
      showHeroBanner: true,
      showFeaturedSection: true,
      showTrendingSection: true,
      showAllComicsSection: true,
      showHowItWorks: true,
      showGenresSection: true,
      showNewsletter: true,
      showCreatorSection: true,
      heroTitle: "DISCOVER. READ. REMEMBER.",
      heroSubtitle: "Where stories come alive, one panel at a time.",
      footerText: "Where stories come alive, one panel at a time.",
    },
  });
  console.log("✓ Default site settings initialized");

  // 4. Original series: AFTER//US
  const sciFiGenre = await db.genre.findUnique({ where: { name: "Sci-Fi" } });
  const mysteryGenre = await db.genre.findUnique({ where: { name: "Mystery" } });

  const comic = await db.comic.upsert({
    where: { slug: "after-us" },
    update: { title: "AFTER//US", coverImage: "/afterus.png", bannerImage: "/afterus.png", author: "Arialtia", artist: "Arialtia", submittedById: arialtia.id },
    create: {
      slug: "after-us",
      title: "AFTER//US",
      synopsis:
        "A lone survivor wakes in a city reclaimed by nature and watched by something that has waited thousands of days to speak.",
      coverImage: "/afterus.png",
      bannerImage: "/afterus.png",
      author: "Arialtia",
      artist: "Arialtia",
      submittedById: arialtia.id,
      status: "ongoing",
      rating: 0,
      views: 0,
      isFeatured: true,
      chapters: {
        create: [
          {
            number: 0,
            title: "Chapter 0",
            approvalStatus: "APPROVED",
            views: 0,
            pages: {
              create: Array.from({ length: 21 }, (_, index) => ({ pageNumber: index + 1, imageUrl: `/uploads/after-us/chapter-0/page-${String(index + 1).padStart(2, "0")}.jpg` })),
            },
          },
          { number: 1, title: "The City That Forgot Me", approvalStatus: "APPROVED", views: 0, pages: { create: Array.from({ length: 6 }, (_, index) => ({ pageNumber: index + 1, imageUrl: `/uploads/after-us/chapter-1/page-${index + 1}.jpg` })) } },
        ],
      },
    },
  });

  if (sciFiGenre && mysteryGenre) {
    await db.comicGenre.upsert({
      where: { comicId_genreId: { comicId: comic.id, genreId: sciFiGenre.id } },
      update: {},
      create: { comicId: comic.id, genreId: sciFiGenre.id },
    });
    await db.comicGenre.upsert({
      where: { comicId_genreId: { comicId: comic.id, genreId: mysteryGenre.id } },
      update: {},
      create: { comicId: comic.id, genreId: mysteryGenre.id },
    });
  }

  console.log("✓ Initial comic & chapter seeded");
  console.log("\nDatabase seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
