"use client";

import { useState, useMemo } from "react";
import { CrcClassManagementHeader } from "../admin/crc-class-management/CrcClassManagementHeader";
import { BetaCrcClassCreateForm as CrcClassCreateForm } from "./BetaCrcClassCreateForm";
import { BetaCrcClassTable as CrcClassTable } from "./BetaCrcClassTable";
import { BetaViewStudentsDialog } from "./BetaViewStudentsDialog";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyClasses = [
  {
    id: "class1",
    name: "CRC Alpha",
    grade_group: "Senior 6",
    created_at: new Date().toISOString(),
    created_by_name: "Admin User",
    num_students: 45
  },
  {
    id: "class2",
    name: "CRC Beta",
    grade_group: "Senior 5",
    created_at: new Date().toISOString(),
    created_by_name: "Admin User",
    num_students: 38
  },
  {
    id: "class3",
    name: "CRC Gamma",
    grade_group: "Senior 4",
    created_at: new Date().toISOString(),
    created_by_name: "Admin User",
    num_students: 42
  },
];

export function BetaCrcClassManagementContent() {
  const [viewingGroup, setViewingGroup] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return dummyClasses;
    return dummyClasses.filter(g =>
      [g.name, g.created_by_name].some(v => v.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleView = (group: any) => {
    setViewingGroup(group);
    setViewDialogOpen(true);
  };

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <CrcClassManagementHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Create Card (Simplified for demo) */}
        <div onClickCapture={(e) => { e.stopPropagation(); handleAction(); }} className="pointer-events-auto">
          <CrcClassCreateForm />
        </div>

        {/* List Card */}
        <CrcClassTable
          classes={filteredClasses as any}
          loading={false}
          onView={handleView}
          basePath="/demo/admin/crc-class-groups"
        />

        {/* View Students Dialog */}
        <BetaViewStudentsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          viewingGroup={viewingGroup}
        />
      </div>
    </div>
  );
}
