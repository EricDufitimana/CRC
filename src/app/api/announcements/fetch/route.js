import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request) {
  try {
    console.log("🔍 Starting announcements fetch API...");
    
    // Debug 1: Check if prisma is imported
    console.log("Prisma client:", prisma);
    console.log("Prisma type:", typeof prisma);
    console.log("Prisma keys:", prisma ? Object.keys(prisma) : "prisma is undefined");
    
    if (!prisma) {
      console.error("❌ Prisma is undefined");
      return NextResponse.json({ error: "Prisma client is undefined" }, { status: 500 });
    }
    
    console.log("✅ Prisma client is imported successfully");
    
    // Debug 1.5: List all available models in prisma client
    console.log("🔍 Available Prisma models:");
    const prismaKeys = Object.getOwnPropertyNames(prisma);
    console.log("All prisma properties:", prismaKeys);
    
    // Look for models specifically (they usually start with lowercase)
    const models = prismaKeys.filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] !== null && 
      typeof prisma[key].findMany === 'function'
    );
    console.log("Available models:", models);
    
    // Debug 2: Check if we can access the database
    try {
      console.log("🔍 Testing database connection...");
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✅ Database connection successful:", result);
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json({ error: "Database connection failed", details: dbError.message }, { status: 500 });
    }
    
    // Debug 3: Check if announcements model exists
    console.log("🔍 Checking announcements model...");
    console.log("Prisma announcements:", prisma.announcements);
    console.log("Prisma announcements type:", typeof prisma.announcements);
    
    if (!prisma.announcements) {
      console.error("❌ Announcements model not found");
      return NextResponse.json({ error: "Announcements model not found" }, { status: 500 });
    }
    
    // Debug 4: Test simple count query
    try {
      console.log("🔍 Testing announcements count...");
      const count = await prisma.announcements.count();
      console.log("✅ Announcements count:", count);
    } catch (countError) {
      console.error("❌ Announcements count failed:", countError);
      return NextResponse.json({ error: "Announcements table access failed", details: countError.message }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const single = searchParams.get("single") === "true";
    
    console.log("🔍 Query params - page:", page, "single:", single);

    const nowIso = new Date().toISOString();

    if (single) {
      const whereClause = {
        OR: [{ is_active: true }, { is_active: null }],
        end_time: { gt: new Date(nowIso) },
        ...(page ? { page } : {}),
      };

      const n = await prisma.announcements.findFirst({
        where: whereClause,
        orderBy: { created_at: "desc" },
      });

      const notification = n
        ? {
            id: n.id.toString(),
            message: n.message,
            end_time: n.end_time,
            is_active: n.is_active,
            created_at: n.created_at,
            page: n.page,
          }
        : null;
      return NextResponse.json({ notification });
    }

    // Default: list announcements (optionally by page) for admin UI compatibility
    const list = await prisma.announcements.findMany({
      where: page ? { page } : undefined,
      orderBy: { created_at: "desc" },
    });
    const serialized = list.map((n) => ({
      id: n.id.toString(),
      message: n.message,
      end_time: n.end_time,
      is_active: n.is_active,
      created_at: n.created_at,
      page: n.page,
    }));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error("❌ Error in announcements/fetch API:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error details:", JSON.stringify(err, null, 2));
    return NextResponse.json({ 
      error: "Failed to fetch announcements", 
      details: err.message,
      errorName: err.name,
      fullError: err.toString()
    }, { status: 500 });
  }
}

