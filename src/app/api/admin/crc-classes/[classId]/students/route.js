import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(request, { params }) {
  try {
    const classId = params.classId;
    
    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    // Get the CRC class with its students
    const crcClass = await prisma.crc_class.findUnique({
      where: { id: BigInt(classId) },
      include: {
        admin: { select: { first_name: true, last_name: true } },
        students: { 
          select: { 
            id: true, 
            student_id: true,
            first_name: true, 
            last_name: true, 
            email: true,
            grade: true,
            major_short: true,
            gpa: true
          },
          orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }]
        },
      },
    });

    if (!crcClass) {
      return NextResponse.json({ error: "CRC class not found" }, { status: 404 });
    }

    const serialized = {
      id: crcClass.id.toString(),
      name: crcClass.name,
      created_by_name: `${crcClass.admin.first_name} ${crcClass.admin.last_name}`.trim(),
      created_at: crcClass.created_at,
      students: crcClass.students.map(s => ({
        id: s.id.toString(),
        student_id: s.student_id,
        full_name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        grade: s.grade,
        major_short: s.major_short,
        gpa: s.gpa,
      }))
    };

    return NextResponse.json({ class: serialized });
  } catch (error) {
    console.error("GET /crc-classes/:id/students error", error);
    return NextResponse.json({ error: "Failed to fetch CRC class students" }, { status: 500 });
  }
}
