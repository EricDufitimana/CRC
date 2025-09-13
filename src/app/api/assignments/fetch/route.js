import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    const limitParam = searchParams.get("limit");

    let list;
    
    if (studentIdParam) {
      // If studentId is provided, filter by CRC class
      const studentId = BigInt(studentIdParam);
      
      // Get student's CRC class
      const student = await prisma.students.findUnique({
        where: { id: studentId },
        select: { 
          crc_class: {
            select: { id: true, name: true }
          }
        }
      });

      if (!student || !student.crc_class) {
        return NextResponse.json({ error: "Student CRC class not found" }, { status: 404 });
      }

      console.log(`Dashboard: Fetching assignments for student ${studentId} with CRC class: ${student.crc_class.name} (ID: ${student.crc_class.id})`);

      list = await prisma.assignments.findMany({
        where: {
          workshops: {
            workshop_to_crc: {
              some: {
                crc_class_id: student.crc_class.id
              }
            }
          },
          // Exclude assignments that the student has already submitted
          submissions: {
            none: {
              student_id: studentId
            }
          }
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          submission_style: true,
          submission_idate: true,
          created_at: true,
        },
        ...(limitParam && { take: parseInt(limitParam) })
      });
    } else {
      // If no studentId, return all assignments (for admin use)
      list = await prisma.assignments.findMany({
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          submission_style: true,
          submission_idate: true,
          created_at: true,
        },
        ...(limitParam && { take: parseInt(limitParam) })
      });
    }

    const serialized = list.map((row) => ({
      id: row.id != null ? row.id.toString() : '',
      title: row.title || '',
      submission_style: row.submission_style,
      submission_idate: row.submission_idate || null,
      created_at: row.created_at || null,
    }))

    return NextResponse.json(serialized)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

