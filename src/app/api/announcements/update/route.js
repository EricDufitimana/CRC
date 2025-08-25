import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const { id, message, page, end_time, is_active } = await request.json();

    if (!id || !message || !page) {
      return NextResponse.json(
        { error: "Missing required fields: id, message, page" },
        { status: 400 }
      );
    }

    // Update the announcement in the database
    const updatedAnnouncement = await prisma.announcements.update({
      where: {
        id: BigInt(id)
      },
      data: {
        message,
        page,
        end_time: end_time ? new Date(end_time) : null,
        is_active: is_active ?? true,
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
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
