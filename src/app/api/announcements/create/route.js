import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { message, page, end_time, is_active } = await request.json();
    
    // Debug logging
    console.log("📝 Received data:", { message, page, end_time, is_active });
    console.log("🔍 end_time type:", typeof end_time);
    console.log("🔍 end_time value:", end_time);

    if (!message || !page) {
      return NextResponse.json(
        { error: "Missing required fields: message, page" },
        { status: 400 }
      );
    }

    // Debug logging for Prisma data
    const prismaData = {
      message,
      page,
      end_time: end_time ? new Date(end_time) : null,
      is_active: is_active ?? true,
    };
    console.log("🗄️ Prisma data being sent:", prismaData);
    
    // Create the announcement in the database
    const newAnnouncement = await prisma.announcements.create({
      data: prismaData,
    });

    // Convert BigInt to string for JSON serialization
    const response = {
      ...newAnnouncement,
      id: newAnnouncement.id.toString(),
      end_time: newAnnouncement.end_time?.toISOString() || null,
      created_at: newAnnouncement.created_at?.toISOString(),
    };

    return NextResponse.json({ announcement: response });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
