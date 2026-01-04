"use client";

import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CrcClassManagementHeader } from "./CrcClassManagementHeader";
import { CrcClassCreateForm } from "./CrcClassCreateForm";
import { CrcClassTable } from "./CrcClassTable";
import { ViewStudentsDialog } from "./ViewStudentsDialog";
import type { CrcClass } from "./types";

export function CrcClassManagementContent() {
  const trpc = useTRPC();
  const [viewingGroup, setViewingGroup] = useState<CrcClass | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data using tRPC
  const { data: classesData = [] } = useSuspenseQuery(
    trpc.crcClassManagement.getCrcClasses.queryOptions(undefined)
  );

  // Convert Date to string for compatibility
  const classes = classesData.map(c => ({
    ...c,
    created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at
  }));

  // Filter classes based on search query
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(g =>
      [g.name, g.created_by_name]
        .some(v => v.toLowerCase().includes(q))
    );
  }, [classes, searchQuery]);

  const handleView = (group: CrcClass) => {
    setViewingGroup(group);
    setViewDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <CrcClassManagementHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Create Card */}
        <CrcClassCreateForm />

        {/* List Card */}
        <CrcClassTable
          classes={filteredClasses}
          loading={false}
          onView={handleView}
        />

        {/* View Students Dialog */}
        <ViewStudentsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          viewingGroup={viewingGroup}
        />
      </div>
    </div>
  );
}

