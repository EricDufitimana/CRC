import { protectedProcedure, studentProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { StudentUser } from "../init";

/**
 * CRP (College Readiness Program) — student router.
 *
 * Phase 2: cohort membership (isParticipant).
 * Phase 3: colleges (College Scorecard search + cache), applications, deadlines.
 */

const SCORECARD_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const roundEnum = z.enum(["SCEA", "ED", "ED2", "EA", "RD", "ROLLING"]);
const essayStatusEnum = z.enum([
  "not_started",
  "drafting",
  "revising",
  "reviewer_sent",
  "final",
  "submitted",
]);
const essayScopeEnum = z.enum(["shared", "school"]);

// Only CRP-appointed students may touch CRP data.
const crpProcedure = studentProcedure.use(async ({ ctx, next }) => {
  const participant = await prisma.crp_participants.findFirst({
    where: { student_id: (ctx.user as StudentUser).id, active: true },
    select: { id: true },
  });
  if (!participant) throw new TRPCError({ code: "FORBIDDEN", message: "Not in the CRP cohort" });
  return next({ ctx });
});

// "https://www.yale.edu/admissions" -> "yale.edu"
function toDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  return (
    url
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split(/[/?#]/)[0]
      .toLowerCase() || null
  );
}

function serializeApplication(a: {
  id: bigint;
  round: string | null;
  deadline: Date | null;
  submitted: boolean;
  finaid_status: string | null;
  scores_status: string | null;
  notes: string | null;
  college: { id: bigint; name: string; city: string | null; state: string | null; domain: string | null; logo_url: string | null };
}) {
  return {
    id: a.id.toString(),
    round: a.round,
    deadline: a.deadline ? a.deadline.toISOString().slice(0, 10) : null,
    submitted: a.submitted,
    finaidStatus: a.finaid_status,
    scoresStatus: a.scores_status,
    notes: a.notes,
    college: {
      id: a.college.id.toString(),
      name: a.college.name,
      city: a.college.city,
      state: a.college.state,
      domain: a.college.domain,
      logoUrl: a.college.logo_url,
    },
  };
}

export const crpStudentRouter = createTRPCRouter({
  isParticipant: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.role !== "student") return false;
    try {
      const participant = await prisma.crp_participants.findFirst({
        where: { student_id: (ctx.user as StudentUser).id, active: true },
        select: { id: true },
      });
      return !!participant;
    } catch {
      return false;
    }
  }),

  // Live search against the U.S. Dept. of Education's College Scorecard.
  searchColleges: crpProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      const key = process.env.COLLEGE_SCORECARD_API_KEY || "DEMO_KEY";
      const params = new URLSearchParams({
        api_key: key,
        "school.name": input.query,
        fields: "id,school.name,school.city,school.state,school.school_url",
        per_page: "8",
        sort: "latest.student.size:desc",
      });

      let json: any;
      try {
        const res = await fetch(`${SCORECARD_URL}?${params.toString()}`, {
          // College data is stable — cache upstream responses for a day.
          next: { revalidate: 86400 },
        });
        if (!res.ok) throw new Error(`Scorecard ${res.status}`);
        json = await res.json();
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "College search is unavailable right now. Try again shortly.",
        });
      }

      return (json.results ?? []).map((r: any) => {
        const domain = toDomain(r["school.school_url"]);
        return {
          scorecardId: String(r.id),
          name: r["school.name"] as string,
          city: (r["school.city"] as string) ?? null,
          state: (r["school.state"] as string) ?? null,
          domain,
          logoUrl: domain ? `https://logo.clearbit.com/${domain}` : null,
        };
      });
    }),

  listApplications: crpProcedure.query(async ({ ctx }) => {
    const apps = await prisma.crp_applications.findMany({
      where: { student_id: (ctx.user as StudentUser).id },
      orderBy: [{ deadline: "asc" }, { created_at: "asc" }],
      include: {
        college: {
          select: { id: true, name: true, city: true, state: true, domain: true, logo_url: true },
        },
      },
    });
    return apps.map(serializeApplication);
  }),

  addApplication: crpProcedure
    .input(
      z.object({
        scorecardId: z.string(),
        name: z.string().min(1),
        city: z.string().nullish(),
        state: z.string().nullish(),
        domain: z.string().nullish(),
        round: roundEnum.optional(),
        deadline: z.string().optional(), // yyyy-mm-dd
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      const logoUrl = input.domain ? `https://logo.clearbit.com/${input.domain}` : null;

      // Cache/refresh the college record.
      const college = await prisma.crp_colleges.upsert({
        where: { scorecard_id: input.scorecardId },
        update: {
          name: input.name,
          city: input.city ?? null,
          state: input.state ?? null,
          domain: input.domain ?? null,
          logo_url: logoUrl,
        },
        create: {
          scorecard_id: input.scorecardId,
          name: input.name,
          city: input.city ?? null,
          state: input.state ?? null,
          domain: input.domain ?? null,
          logo_url: logoUrl,
        },
      });

      // One application per (student, college).
      const existing = await prisma.crp_applications.findFirst({
        where: { student_id: studentId, college_id: college.id },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: `${input.name} is already on your list` });
      }

      const app = await prisma.crp_applications.create({
        data: {
          student_id: studentId,
          college_id: college.id,
          round: input.round,
          deadline: input.deadline ? new Date(input.deadline) : null,
        },
      });

      return { id: app.id.toString() };
    }),

  updateApplication: crpProcedure
    .input(
      z.object({
        id: z.string(),
        round: roundEnum.nullish(),
        deadline: z.string().nullish(), // yyyy-mm-dd or null to clear
        submitted: z.boolean().optional(),
        finaidStatus: z.string().nullish(),
        scoresStatus: z.string().nullish(),
        notes: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;

      // Ownership check.
      const owned = await prisma.crp_applications.findFirst({
        where: { id: BigInt(input.id), student_id: studentId },
        select: { id: true },
      });
      if (!owned) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.crp_applications.update({
        where: { id: BigInt(input.id) },
        data: {
          ...(input.round !== undefined ? { round: input.round } : {}),
          ...(input.deadline !== undefined
            ? { deadline: input.deadline ? new Date(input.deadline) : null }
            : {}),
          ...(input.submitted !== undefined ? { submitted: input.submitted } : {}),
          ...(input.finaidStatus !== undefined ? { finaid_status: input.finaidStatus } : {}),
          ...(input.scoresStatus !== undefined ? { scores_status: input.scoresStatus } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          updated_at: new Date(),
        },
      });

      return { id: input.id };
    }),

  removeApplication: crpProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      await prisma.crp_applications.deleteMany({
        where: { id: BigInt(input.id), student_id: studentId },
      });
      return { id: input.id };
    }),

  // ── Essays ──────────────────────────────────────────────────
  listEssays: crpProcedure.query(async ({ ctx }) => {
    const essays = await prisma.crp_essays.findMany({
      where: { student_id: (ctx.user as StudentUser).id },
      orderBy: [{ created_at: "asc" }],
      include: {
        application: {
          select: { id: true, college: { select: { name: true, domain: true, logo_url: true } } },
        },
      },
    });

    return essays.map((e) => ({
      id: e.id.toString(),
      scope: e.scope as "shared" | "school",
      type: e.type,
      prompt: e.prompt,
      words: e.words,
      status: e.status as string,
      draftLink: e.draft_link,
      due: e.due ? e.due.toISOString().slice(0, 10) : null,
      applicationId: e.application_id ? e.application_id.toString() : null,
      college: e.application?.college
        ? { name: e.application.college.name, logoUrl: e.application.college.logo_url }
        : null,
    }));
  }),

  addEssay: crpProcedure
    .input(
      z.object({
        scope: essayScopeEnum,
        applicationId: z.string().nullish(),
        type: z.string().min(1).max(120),
        prompt: z.string().max(4000).nullish(),
        words: z.string().max(40).nullish(),
        draftLink: z.string().max(1000).nullish(),
        due: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;

      let applicationId: bigint | null = null;
      if (input.scope === "school") {
        if (!input.applicationId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Pick a college for this essay" });
        }
        const owned = await prisma.crp_applications.findFirst({
          where: { id: BigInt(input.applicationId), student_id: studentId },
          select: { id: true },
        });
        if (!owned) throw new TRPCError({ code: "NOT_FOUND", message: "College not found" });
        applicationId = owned.id;
      }

      const essay = await prisma.crp_essays.create({
        data: {
          student_id: studentId,
          application_id: applicationId,
          scope: input.scope,
          type: input.type,
          prompt: input.prompt ?? null,
          words: input.words ?? null,
          draft_link: input.draftLink ?? null,
          due: input.due ? new Date(input.due) : null,
        },
      });

      return { id: essay.id.toString() };
    }),

  updateEssay: crpProcedure
    .input(
      z.object({
        id: z.string(),
        status: essayStatusEnum.optional(),
        type: z.string().min(1).max(120).optional(),
        prompt: z.string().max(4000).nullish(),
        words: z.string().max(40).nullish(),
        draftLink: z.string().max(1000).nullish(),
        due: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      const owned = await prisma.crp_essays.findFirst({
        where: { id: BigInt(input.id), student_id: studentId },
        select: { id: true },
      });
      if (!owned) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.crp_essays.update({
        where: { id: BigInt(input.id) },
        data: {
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.prompt !== undefined ? { prompt: input.prompt } : {}),
          ...(input.words !== undefined ? { words: input.words } : {}),
          ...(input.draftLink !== undefined ? { draft_link: input.draftLink } : {}),
          ...(input.due !== undefined ? { due: input.due ? new Date(input.due) : null } : {}),
          updated_at: new Date(),
        },
      });

      return { id: input.id };
    }),

  removeEssay: crpProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      await prisma.crp_essays.deleteMany({
        where: { id: BigInt(input.id), student_id: studentId },
      });
      return { id: input.id };
    }),

  // ── Recommendations ─────────────────────────────────────────
  listRecommendations: crpProcedure.query(async ({ ctx }) => {
    const recs = await prisma.crp_recommendations.findMany({
      where: { student_id: (ctx.user as StudentUser).id },
      orderBy: { created_at: "asc" },
    });
    return recs.map((r) => ({
      id: r.id.toString(),
      recommender: r.recommender,
      role: r.role,
      forSchools: r.for_schools,
      requested: r.requested,
      bragSheet: r.brag_sheet,
      submitted: r.submitted,
      notes: r.notes,
    }));
  }),

  addRecommendation: crpProcedure
    .input(
      z.object({
        recommender: z.string().min(1).max(120),
        role: z.string().max(120).nullish(),
        forSchools: z.string().max(200).nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rec = await prisma.crp_recommendations.create({
        data: {
          student_id: (ctx.user as StudentUser).id,
          recommender: input.recommender,
          role: input.role ?? null,
          for_schools: input.forSchools ?? null,
        },
      });
      return { id: rec.id.toString() };
    }),

  updateRecommendation: crpProcedure
    .input(
      z.object({
        id: z.string(),
        recommender: z.string().min(1).max(120).optional(),
        role: z.string().max(120).nullish(),
        forSchools: z.string().max(200).nullish(),
        requested: z.boolean().optional(),
        bragSheet: z.boolean().optional(),
        submitted: z.boolean().optional(),
        notes: z.string().max(2000).nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      const owned = await prisma.crp_recommendations.findFirst({
        where: { id: BigInt(input.id), student_id: studentId },
        select: { id: true },
      });
      if (!owned) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.crp_recommendations.update({
        where: { id: BigInt(input.id) },
        data: {
          ...(input.recommender !== undefined ? { recommender: input.recommender } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.forSchools !== undefined ? { for_schools: input.forSchools } : {}),
          ...(input.requested !== undefined ? { requested: input.requested } : {}),
          ...(input.bragSheet !== undefined ? { brag_sheet: input.bragSheet } : {}),
          ...(input.submitted !== undefined ? { submitted: input.submitted } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        },
      });
      return { id: input.id };
    }),

  removeRecommendation: crpProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      await prisma.crp_recommendations.deleteMany({
        where: { id: BigInt(input.id), student_id: studentId },
      });
      return { id: input.id };
    }),

  // ── To-do ───────────────────────────────────────────────────
  listTasks: crpProcedure.query(async ({ ctx }) => {
    const tasks = await prisma.crp_tasks.findMany({
      where: { student_id: (ctx.user as StudentUser).id },
      orderBy: [{ done: "asc" }, { due: "asc" }, { created_at: "asc" }],
    });
    return tasks.map((t) => ({
      id: t.id.toString(),
      task: t.task,
      area: t.area,
      priority: t.priority as string | null,
      due: t.due ? t.due.toISOString().slice(0, 10) : null,
      done: t.done,
      notes: t.notes,
    }));
  }),

  addTask: crpProcedure
    .input(
      z.object({
        task: z.string().min(1).max(300),
        area: z.string().max(120).nullish(),
        priority: z.enum(["high", "medium", "low"]).nullish(),
        due: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const t = await prisma.crp_tasks.create({
        data: {
          student_id: (ctx.user as StudentUser).id,
          task: input.task,
          area: input.area ?? null,
          priority: input.priority ?? null,
          due: input.due ? new Date(input.due) : null,
        },
      });
      return { id: t.id.toString() };
    }),

  updateTask: crpProcedure
    .input(
      z.object({
        id: z.string(),
        task: z.string().min(1).max(300).optional(),
        area: z.string().max(120).nullish(),
        priority: z.enum(["high", "medium", "low"]).nullish(),
        due: z.string().nullish(),
        done: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      const owned = await prisma.crp_tasks.findFirst({
        where: { id: BigInt(input.id), student_id: studentId },
        select: { id: true },
      });
      if (!owned) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.crp_tasks.update({
        where: { id: BigInt(input.id) },
        data: {
          ...(input.task !== undefined ? { task: input.task } : {}),
          ...(input.area !== undefined ? { area: input.area } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.due !== undefined ? { due: input.due ? new Date(input.due) : null } : {}),
          ...(input.done !== undefined ? { done: input.done } : {}),
        },
      });
      return { id: input.id };
    }),

  removeTask: crpProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentId = (ctx.user as StudentUser).id;
      await prisma.crp_tasks.deleteMany({
        where: { id: BigInt(input.id), student_id: studentId },
      });
      return { id: input.id };
    }),
});
