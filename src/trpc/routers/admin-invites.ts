import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const adminInvitesRouter = createTRPCRouter({
  validateToken: baseProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const invite = await prisma.admin_invites.findUnique({
        where: { token: input.token },
      });

      if (!invite) {
        return { valid: false, reason: "Token not found" };
      }

      if (invite.used_at) {
        return { valid: false, reason: "Token already used" };
      }

      if (new Date() > invite.expires_at) {
        return { valid: false, reason: "Token expired" };
      }

      return {
        valid: true,
        email: invite.email,
        token: invite.token,
      };
    }),

  listInvites: adminProcedure.query(async () => {
    const invites = await prisma.admin_invites.findMany({
      orderBy: {
        created_at: "desc",
      },
      take: 100,
    });

    return invites.map((invite) => ({
      id: invite.id.toString(),
      email: invite.email,
      token: invite.token,
      created_at: invite.created_at.toISOString(),
      expires_at: invite.expires_at.toISOString(),
      used_at: invite.used_at ? invite.used_at.toISOString() : null,
    }));
  }),

  createInvites: adminProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const now = new Date();
        const expiresAt = addDays(now, 7);

        const created = await prisma.$transaction(
          input.emails.map((email) =>
            prisma.admin_invites.create({
              data: {
                email,
                token: randomUUID(),
                expires_at: expiresAt,
                used_at: null,
              },
              select: { id: true, token: true, email: true },
            })
          )
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const emailPromises = created.map(async (invite) => {
          const link = `${appUrl}/create-admin?token=${invite.token}`;
          try {
            const { error } = await supabase.functions.invoke("send_admin_invites", {
              body: { email: invite.email, link },
            });
            if (error) {
              console.error(`Failed to send email to ${invite.email}:`, error);
            }
          } catch (err) {
            console.error(`Error invoking send_admin_invites for ${invite.email}:`, err);
          }
        });

        await Promise.allSettled(emailPromises);

        return {
          success: true,
          count: created.length,
        };
      } catch (error) {
        console.error("Error creating admin invites:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create admin invites",
        });
      }
    }),

  acceptInvite: baseProcedure
    .input(
      z.object({
        token: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const invite = await prisma.admin_invites.findUnique({
          where: { token: input.token },
        });

        if (!invite) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid invite token",
          });
        }

        if (invite.used_at) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invite already used",
          });
        }

        if (new Date() > invite.expires_at) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invite expired",
          });
        }

        // Create Supabase user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: invite.email,
          password: input.password,
          options: {
            data: {
              first_name: input.firstName,
              last_name: input.lastName,
            },
          },
        });

        if (authError || !authData.user) {
          console.error("Auth error:", authError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user account",
          });
        }

        // Create admin record
        const admin = await prisma.admin.create({
          data: {
            user_id: authData.user.id,
            first_name: input.firstName,
            last_name: input.lastName,
            email: invite.email,
            role: "admin",
          },
        });

        // Mark invite as used
        await prisma.admin_invites.update({
          where: { id: invite.id },
          data: { used_at: new Date() },
        });

        return {
          success: true,
          userId: authData.user.id,
          adminId: admin.id.toString(),
        };
      } catch (error) {
        console.error("Error accepting invite:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invite",
        });
      }
    }),
});
