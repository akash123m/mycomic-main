import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          id: "global",
          primaryColor: "#9dfb2b",
          secondaryColor: "#da009d",
          tertiaryColor: "#079ea8",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updated = await db.siteSettings.upsert({
      where: { id: "global" },
      update: {
        ...(data.primaryColor && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor && { secondaryColor: data.secondaryColor }),
        ...(data.tertiaryColor && { tertiaryColor: data.tertiaryColor }),
        ...(data.showHeroBanner !== undefined && { showHeroBanner: Boolean(data.showHeroBanner) }),
        ...(data.showFeaturedSection !== undefined && { showFeaturedSection: Boolean(data.showFeaturedSection) }),
        ...(data.showTrendingSection !== undefined && { showTrendingSection: Boolean(data.showTrendingSection) }),
        ...(data.showAllComicsSection !== undefined && { showAllComicsSection: Boolean(data.showAllComicsSection) }),
        ...(data.showHowItWorks !== undefined && { showHowItWorks: Boolean(data.showHowItWorks) }),
        ...(data.showGenresSection !== undefined && { showGenresSection: Boolean(data.showGenresSection) }),
        ...(data.showNewsletter !== undefined && { showNewsletter: Boolean(data.showNewsletter) }),
        ...(data.showCreatorSection !== undefined && { showCreatorSection: Boolean(data.showCreatorSection) }),
        ...(data.heroTitle && { heroTitle: data.heroTitle }),
        ...(data.heroSubtitle && { heroSubtitle: data.heroSubtitle }),
        ...(data.footerText && { footerText: data.footerText }),
      },
      create: {
        id: "global",
        ...data,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
