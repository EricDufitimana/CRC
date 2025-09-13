import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    if (!studentIdParam) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const studentId = BigInt(studentIdParam);

    // First, get the student's CRC class
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

    console.log(`Fetching assignments for student ${studentId} with CRC class: ${student.crc_class.name} (ID: ${student.crc_class.id})`);

    const list = await prisma.assignments.findMany({
      where: {
        workshops: {
          workshop_to_crc: {
            some: {
              crc_class_id: student.crc_class.id
            }
          }
        }
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        submission_style: true,
        submission_idate: true,
        created_at: true,
        workshops: {
          select: { 
            id: true, 
            title: true,
            workshop_to_crc: {
              select: {
                crc_class: {
                  select: { name: true }
                }
              }
            }
          }
        },
        submissions: {
          where: { student_id: studentId },
          select: {
            id: true,
            submitted_at: true,
            google_doc_link: true,
            file_upload_link: true,
          },
          take: 1,
        },
      },
    });

    const serialized = list.map((row) => {
      const submission = row.submissions && row.submissions[0] ? row.submissions[0] : null;
      return {
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        submission_style: row.submission_style,
        due_date: row.submission_idate,
        created_at: row.created_at,
        workshop: row.workshops ? { id: row.workshops.id.toString(), title: row.workshops.title } : null,
        submission: submission
          ? {
              id: submission.id.toString(),
              submitted_at: submission.submitted_at,
              google_doc_link: submission.google_doc_link,
              file_upload_link: submission.file_upload_link,
            }
          : null,
        status: submission ? "submitted" : "not_submitted",
      };
    });

    return NextResponse.json(serialized);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

