import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    
    console.log("🔍 Debug endpoint called for page:", page);
    
    // Get all announcements without filtering
    const allAnnouncements = await prisma.announcements.findMany({
      orderBy: { created_at: "desc" },
    });
    
    console.log("📊 Total announcements in database:", allAnnouncements.length);
    
    // Get announcements for specific page
    const pageAnnouncements = await prisma.announcements.findMany({
      where: page ? { page } : undefined,
      orderBy: { created_at: "desc" },
    });
    
    console.log(`📋 Announcements for page "${page}":`, pageAnnouncements.length);
    
    // Get active announcements for page
    const now = new Date();
    const activePageAnnouncements = await prisma.announcements.findMany({
      where: {
        AND: [
          { OR: [{ is_active: true }, { is_active: null }] },
          page ? { page } : {},
          { end_time: { gt: now } }
        ]
      },
      orderBy: { created_at: "desc" },
    });
    
    console.log(`✅ Active announcements for page "${page}":`, activePageAnnouncements.length);
    
    return NextResponse.json({
      debug: true,
      page,
      now: now.toISOString(),
      total_in_db: allAnnouncements.length,
      for_page: pageAnnouncements.length,
      active_for_page: activePageAnnouncements.length,
      all_announcements: allAnnouncements.map(a => ({
        id: a.id,
        page: a.page,
        is_active: a.is_active,
        end_time: a.end_time,
        created_at: a.created_at,
        message_preview: a.message?.substring(0, 100) + "..."
      })),
      page_announcements: pageAnnouncements.map(a => ({
        id: a.id,
        page: a.page,
        is_active: a.is_active,
        end_time: a.end_time,
        created_at: a.created_at,
        message_preview: a.message?.substring(0, 100) + "..."
      })),
      active_page_announcements: activePageAnnouncements.map(a => ({
        id: a.id,
        page: a.page,
        is_active: a.is_active,
        end_time: a.end_time,
        created_at: a.created_at,
        message_preview: a.message?.substring(0, 100) + "..."
      }))
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
