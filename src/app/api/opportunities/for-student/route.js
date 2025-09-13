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

    const list = await prisma.opportunities.findMany({
      where: { student_id: studentId },
      orderBy: { submitted_at: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        deadline: true,
        submitted_at: true,
        status: true,
        referred: true,
        admin: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            honorific: true,
          },
        },
      },
    });

    const serialized = list.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      link: row.link,
      deadline: row.deadline,
      submitted_at: row.submitted_at,
      status: row.status, // pending | in_review | accepted | denied
      referred: row.referred,
      admin: row.admin
        ? {
            id: row.admin.id.toString(),
            name: [row.admin.honorific, row.admin.first_name, row.admin.last_name]
              .filter(Boolean)
              .join(" "),
          }
        : null,
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

