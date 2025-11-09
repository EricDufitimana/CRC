import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const { id, is_active } = await request.json();

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: "Missing required fields: id, is_active" },
        { status: 400 }
      );
    }

    // Update only the is_active status
    const updatedAnnouncement = await prisma.announcements.update({
      where: {
        id: BigInt(id)
      },
      data: {
        is_active: is_active,
      },
    });

    // Convert BigInt to string for JSON serialization
    const response = {
      ...updatedAnnouncement,
      id: updatedAnnouncement.id.toString(),
      end_time: updatedAnnouncement.end_time?.toISOString() || null,
      created_at: updatedAnnouncement.created_at?.toISOString(),
    };

    return NextResponse.json({ announcement: response });
  } catch (error) {
    console.error("Error updating announcement status:", error);
    return NextResponse.json(
      { error: "Failed to update announcement status" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

