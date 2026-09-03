import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Pipeline weights (kept in sync with src/components/crp/pipeline.ts).
const WEIGHTS: Record<string, number> = {
  not_started: 0,
  drafting: 0.25,
  revising: 0.5,
  reviewer_sent: 0.7,
  final: 0.9,
  submitted: 1,
};

function todayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * CRP (College Readiness Program) — admin/staff router.
 *
 * Phase 1 scope: appoint students into the CRP cohort and read who's in it.
 * Cohort overview / review queue / student detail land in later phases.
 */
export const crpAdminRouter = createTRPCRouter({
  // Active-participant student ids, as strings — drives the "Appoint" toggle
  // in student management.
  getParticipantIds: adminProcedure.query(async () => {
    try {
      const rows = await prisma.crp_participants.findMany({
        where: { active: true },
        select: { student_id: true },
      });
      return rows.map((r) => r.student_id.toString());
    } catch {
      // Table may not exist yet (migration not applied) — fail soft so
      // student management keeps working; no participants shown.
      return [] as string[];
    }
  }),

  // Full cohort list with the essentials for a roster view.
  listParticipants: adminProcedure.query(async () => {
    const rows = await prisma.crp_participants.findMany({
      where: { active: true },
      orderBy: { appointed_at: "desc" },
      select: {
        appointed_at: true,
        students: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            grade: true,
            profile_picture: true,
          },
        },
      },
    });

    return rows.map((r) => ({
      studentId: r.students.id.toString(),
      fullName: [r.students.first_name, r.students.last_name].filter(Boolean).join(" "),
      email: r.students.email,
      grade: r.students.grade ? r.students.grade.replace(/_/g, " ") : null,
      profilePicture: r.students.profile_picture,
      appointedAt: r.appointed_at,
    }));
  }),

  // Appoint a student into the CRP cohort (idempotent — reactivates if they
  // were previously removed).
  appointStudent: adminProcedure
    .input(z.object({ studentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentId = BigInt(input.studentId);

      const student = await prisma.students.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      await prisma.crp_participants.upsert({
        where: { student_id: studentId },
        update: { active: true, appointed_by: ctx.user.id },
        create: { student_id: studentId, appointed_by: ctx.user.id, active: true },
      });

      return { studentId: input.studentId, active: true };
    }),

  // Remove a student from the CRP cohort (soft — keeps the appointment record).
  removeParticipant: adminProcedure
    .input(z.object({ studentId: z.string() }))
    .mutation(async ({ input }) => {
      const studentId = BigInt(input.studentId);
      await prisma.crp_participants.updateMany({
        where: { student_id: studentId },
        data: { active: false },
      });
      return { studentId: input.studentId, active: false };
    }),

  // Cohort roster with per-student rollups.
  getCohortOverview: adminProcedure.query(async () => {
    const participants = await prisma.crp_participants.findMany({
      where: { active: true },
      orderBy: { appointed_at: "desc" },
      select: {
        students: {
          select: { id: true, first_name: true, last_name: true, email: true, grade: true },
        },
      },
    });
    if (participants.length === 0) return [];

    const ids = participants.map((p) => p.students.id);
    const [essays, apps] = await Promise.all([
      prisma.crp_essays.findMany({ where: { student_id: { in: ids } }, select: { student_id: true, status: true } }),
      prisma.crp_applications.findMany({
        where: { student_id: { in: ids } },
        select: { student_id: true, deadline: true, submitted: true },
      }),
    ]);

    const today = todayMidnight();

    return participants
      .map((p) => {
        const sid = p.students.id;
        const myEssays = essays.filter((e) => e.student_id === sid);
        const myApps = apps.filter((a) => a.student_id === sid);

        const total = myEssays.length;
        const sum = myEssays.reduce((acc, e) => acc + (WEIGHTS[e.status] ?? 0), 0);
        const completion = total ? Math.round((sum / total) * 100) : 0;
        const reviewerSent = myEssays.filter((e) => e.status === "reviewer_sent").length;
        const submittedEssays = myEssays.filter((e) => e.status === "submitted").length;

        const upcoming = myApps
          .filter((a) => a.deadline && !a.submitted && a.deadline >= today)
          .map((a) => a.deadline!)
          .sort((x, y) => x.getTime() - y.getTime())[0];

        return {
          studentId: sid.toString(),
          fullName: [p.students.first_name, p.students.last_name].filter(Boolean).join(" "),
          email: p.students.email,
          grade: p.students.grade ? p.students.grade.replace(/_/g, " ") : null,
          completion,
          totalEssays: total,
          submittedEssays,
          reviewerSent,
          colleges: myApps.length,
          nextDeadline: upcoming ? upcoming.toISOString().slice(0, 10) : null,
        };
      })
      .sort((a, b) => {
        // Needs-review first, then behind, then soonest deadline.
        if (b.reviewerSent !== a.reviewerSent) return b.reviewerSent - a.reviewerSent;
        if (a.completion !== b.completion) return a.completion - b.completion;
        return (a.nextDeadline ?? "9999").localeCompare(b.nextDeadline ?? "9999");
      });
  }),

  // Every essay across the cohort that's waiting on a reviewer.
  getReviewQueue: adminProcedure.query(async () => {
    const participants = await prisma.crp_participants.findMany({
      where: { active: true },
      select: { student_id: true },
    });
    const ids = participants.map((p) => p.student_id);
    if (ids.length === 0) return [];

    const essays = await prisma.crp_essays.findMany({
      where: { student_id: { in: ids }, status: "reviewer_sent" },
      orderBy: { updated_at: "asc" },
      include: {
        students: { select: { id: true, first_name: true, last_name: true, email: true } },
        application: { select: { college: { select: { name: true, logo_url: true } } } },
      },
    });

    return essays.map((e) => ({
      id: e.id.toString(),
      type: e.type,
      prompt: e.prompt,
      words: e.words,
      draftLink: e.draft_link,
      studentId: e.students.id.toString(),
      studentName: [e.students.first_name, e.students.last_name].filter(Boolean).join(" "),
      studentEmail: e.students.email,
      college: e.application?.college
        ? { name: e.application.college.name, logoUrl: e.application.college.logo_url }
        : null,
    }));
  }),

  // Read-only detail of one student's whole workspace.
  getStudentDetail: adminProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ input }) => {
      const id = BigInt(input.studentId);
      const student = await prisma.students.findUnique({
        where: { id },
        select: { id: true, first_name: true, last_name: true, email: true, grade: true },
      });
      if (!student) throw new TRPCError({ code: "NOT_FOUND" });

      const [apps, essays, recs, tasks] = await Promise.all([
        prisma.crp_applications.findMany({
          where: { student_id: id },
          orderBy: [{ deadline: "asc" }],
          include: { college: { select: { name: true, logo_url: true } } },
        }),
        prisma.crp_essays.findMany({
          where: { student_id: id },
          orderBy: { created_at: "asc" },
          include: { application: { select: { college: { select: { name: true, logo_url: true } } } } },
        }),
        prisma.crp_recommendations.findMany({ where: { student_id: id }, orderBy: { created_at: "asc" } }),
        prisma.crp_tasks.findMany({
          where: { student_id: id },
          orderBy: [{ done: "asc" }, { due: "asc" }],
        }),
      ]);

      const total = essays.length;
      const sum = essays.reduce((acc, e) => acc + (WEIGHTS[e.status] ?? 0), 0);

      return {
        student: {
          id: student.id.toString(),
          fullName: [student.first_name, student.last_name].filter(Boolean).join(" "),
          email: student.email,
          grade: student.grade ? student.grade.replace(/_/g, " ") : null,
        },
        completion: total ? Math.round((sum / total) * 100) : 0,
        applications: apps.map((a) => ({
          id: a.id.toString(),
          round: a.round,
          deadline: a.deadline ? a.deadline.toISOString().slice(0, 10) : null,
          submitted: a.submitted,
          finaidStatus: a.finaid_status,
          scoresStatus: a.scores_status,
          college: { name: a.college.name, logoUrl: a.college.logo_url },
        })),
        essays: essays.map((e) => ({
          id: e.id.toString(),
          type: e.type,
          prompt: e.prompt,
          words: e.words,
          status: e.status as string,
          draftLink: e.draft_link,
          college: e.application?.college
            ? { name: e.application.college.name, logoUrl: e.application.college.logo_url }
            : null,
        })),
        recommendations: recs.map((r) => ({
          id: r.id.toString(),
          recommender: r.recommender,
          role: r.role,
          forSchools: r.for_schools,
          requested: r.requested,
          bragSheet: r.brag_sheet,
          submitted: r.submitted,
        })),
        tasks: tasks.map((t) => ({
          id: t.id.toString(),
          task: t.task,
          area: t.area,
          priority: t.priority as string | null,
          due: t.due ? t.due.toISOString().slice(0, 10) : null,
          done: t.done,
        })),
      };
    }),
});
