"use client";
import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

const STALE_TIME = 30 * 1000;

type Props =
  | { role: "admin"; adminId: string | null }
  | { role: "student" };

export function BackgroundPrefetcher(props: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (props.role === "admin") {
      const tier1 = setTimeout(() => {
        void queryClient.prefetchQuery({
          ...trpc.studentManagement.getStudents.queryOptions(undefined),
          staleTime: STALE_TIME,
        });
        void queryClient.prefetchQuery({
          ...trpc.assignmentsManagement.getAssignmentsForManagement.queryOptions(undefined),
          staleTime: STALE_TIME,
        });
        void queryClient.prefetchQuery({
          ...trpc.workshopsManagement.getWorkshopsByCategory.queryOptions({
            category: "ey",
          }),
          staleTime: STALE_TIME,
        });
      }, 1000);

      const tier2 = setTimeout(() => {
        void queryClient.prefetchQuery({
          ...trpc.eventsManagement.getEvents.queryOptions({
            category: "previous-events",
          }),
          staleTime: STALE_TIME,
        });

        if (props.adminId) {
          void queryClient.prefetchQuery({
            ...trpc.essayRequestsManagement.getEssayRequests.queryOptions({
              admin_id: props.adminId,
            }),
            staleTime: STALE_TIME,
          });
          void queryClient.prefetchQuery({
            ...trpc.opportunityRequestsManagement.getOpportunityRequests.queryOptions({
              admin_id: props.adminId,
            }),
            staleTime: STALE_TIME,
          });
        }
      }, 3000);

      return () => {
        clearTimeout(tier1);
        clearTimeout(tier2);
      };
    }

    // Student role
    const tier1 = setTimeout(() => {
      void queryClient.prefetchQuery({
        ...trpc.studentDashboard.getAssignments.queryOptions(undefined),
        staleTime: STALE_TIME,
      });
    }, 1500);

    return () => clearTimeout(tier1);
  }, [props, queryClient, trpc]);

  return null;
}