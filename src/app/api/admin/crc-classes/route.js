import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.crc_class.findMany({
      include: {
        admin: { select: { first_name: true, last_name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const serialized = classes.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      created_by: c.created_by_id.toString(),
      created_by_name: `${c.admin.first_name} ${c.admin.last_name}`.trim(),
      created_at: c.created_at,
      num_students: c._count.students,
    }));

    return NextResponse.json({ classes: serialized });
  } catch (error) {
    console.error("GET /crc-classes error", error);
    return NextResponse.json({ error: "Failed to fetch CRC classes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, created_by, student_ids } = body || {};

    if (!name || !created_by) {
      return NextResponse.json({ error: "Missing required fields: name and created_by" }, { status: 400 });
    }

    // Create the CRC class
    const created = await prisma.crc_class.create({
      data: {
        name: String(name).trim(),
        created_by_id: BigInt(created_by),
      },
      include: {
        admin: { select: { first_name: true, last_name: true } },
      },
    });

    // If student_ids are provided, assign them to this class
    if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
      await prisma.students.updateMany({
        where: { id: { in: student_ids.map(id => BigInt(id)) } },
        data: { crc_class_id: created.id },
      });
    }

    return NextResponse.json({
      class: {
        id: created.id.toString(),
        name: created.name,
        created_by: created.created_by_id.toString(),
        created_by_name: `${created.admin.first_name} ${created.admin.last_name}`.trim(),
        created_at: created.created_at,
      },
    });
  } catch (error) {
    console.error("POST /crc-classes error", error);
    return NextResponse.json({ error: "Failed to create CRC class" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, student_ids_to_add, student_ids_to_remove } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    // Update class name if provided
    if (name) {
      await prisma.crc_class.update({
        where: { id: BigInt(id) },
        data: { name: String(name).trim() },
      });
    }

    // Add students to this class
    if (student_ids_to_add && Array.isArray(student_ids_to_add) && student_ids_to_add.length > 0) {
      await prisma.students.updateMany({
        where: { id: { in: student_ids_to_add.map(sid => BigInt(sid)) } },
        data: { crc_class_id: BigInt(id) },
      });
    }

    // Remove students from this class
    if (student_ids_to_remove && Array.isArray(student_ids_to_remove) && student_ids_to_remove.length > 0) {
      await prisma.students.updateMany({
        where: { 
          id: { in: student_ids_to_remove.map(sid => BigInt(sid)) },
          crc_class_id: BigInt(id)
        },
        data: { crc_class_id: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /crc-classes error", error);
    return NextResponse.json({ error: "Failed to update CRC class" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    // First, remove all students from this class
    await prisma.students.updateMany({
      where: { crc_class_id: BigInt(id) },
      data: { crc_class_id: null },
    });

    // Then delete the class
    await prisma.crc_class.delete({ where: { id: BigInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /crc-classes error", error);
    return NextResponse.json({ error: "Failed to delete CRC class" }, { status: 500 });
  }
}
