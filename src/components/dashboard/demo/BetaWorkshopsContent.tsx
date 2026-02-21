"use client";

import { useState } from "react";
import { Card, CardContent } from "@/zenith/components/ui/card";
import { WorkshopsHeader } from "../admin/workshops/WorkshopsHeader";
import { WorkshopsNavigation } from "../admin/workshops/WorkshopsNavigation";
import { WorkshopsTable } from "../admin/workshops/WorkshopsTable";
import { showToastError } from "@/components/toasts/ToastError";

const dummyWorkshops = [
  { id: "1", title: "College Essay 101", description: "Introduction to writing personal statements.", presentation_url: "#", google_slide_url: "#", date: "2024-03-15", has_assignment: true, crc_classes: [{ id: "c1", name: "CRC Alpha" }] },
  { id: "2", title: "Resume Building", description: "How to craft a professional resume.", presentation_url: "#", google_slide_url: "#", date: "2024-03-22", has_assignment: true, crc_classes: [{ id: "c2", name: "CRC Beta" }] },
  { id: "3", title: "Interview Prep", description: "Mock interview sessions.", presentation_url: "#", google_slide_url: "#", date: "2024-04-05", has_assignment: false, crc_classes: [{ id: "c1", name: "CRC Alpha" }] },
];

export function BetaWorkshopsContent() {
  const [selectedGroup, setSelectedGroup] = useState<string>("ey");

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <WorkshopsHeader />

      <WorkshopsNavigation
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        onAddWorkshopOpen={handleAction}
        onAddAssignmentOpen={handleAction}
      />

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="px-0">
          <WorkshopsTable
            workshops={dummyWorkshops as any}
            loading={false}
            onEdit={handleAction}
            onDelete={handleAction}
            onViewAssignment={handleAction}
            deletingWorkshopId={null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
