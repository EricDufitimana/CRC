"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent } from "@/zenith/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/zenith/components/ui/dialog";
import { X } from "@phosphor-icons/react";
import { WorkshopsHeader } from "./WorkshopsHeader";
import { WorkshopsNavigation } from "./WorkshopsNavigation";
import { WorkshopsTable } from "./WorkshopsTable";
import { AddWorkshopDialog } from "./AddWorkshopDialog";
import { EditWorkshopDialog } from "./EditWorkshopDialog";
import { DeleteWorkshopDialog } from "./DeleteWorkshopDialog";
import { AssignmentDialog } from "./AssignmentDialog";

type SupabaseWorkshop = {
  id: string;
  title: string;
  description: string;
  presentation_url: string | null;
  google_slide_url: string | null;
  date: string | null;
  has_assignment: boolean;
  crc_classes: { id: string; name: string }[];
};

export function WorkshopsContent() {
  const [selectedGroup, setSelectedGroup] = useState<string>("ey");
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
  const [isEditWorkshopOpen, setIsEditWorkshopOpen] = useState(false);
  const [isDeleteWorkshopOpen, setIsDeleteWorkshopOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<"view" | "add" | "edit">("view");
  const [selectedWorkshop, setSelectedWorkshop] = useState<SupabaseWorkshop | null>(null);

  const trpc = useTRPC();
  const { data: workshops = [], isFetching } = useQuery(
    trpc.workshopsManagement.getWorkshopsByCategory.queryOptions({ category: selectedGroup })
  );

  const handleEdit = (workshop: SupabaseWorkshop) => {
    setSelectedWorkshop(workshop);
    setIsEditWorkshopOpen(true);
  };

  const handleDelete = (workshopId: string) => {
    setSelectedWorkshop((workshops as any).find((w: any) => w.id === workshopId) || null);
    setIsDeleteWorkshopOpen(true);
  };

  const handleViewAssignment = (workshop: SupabaseWorkshop) => {
    setSelectedWorkshop(workshop);
    setAssignmentMode("view");
    setIsAssignmentOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <WorkshopsHeader />

      <WorkshopsNavigation
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        onAddWorkshopOpen={() => setIsAddWorkshopOpen(true)}
        onAddAssignmentOpen={() => {
          setSelectedWorkshop(null);
          setAssignmentMode("add");
          setIsAssignmentOpen(true);
        }}
      />

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="px-0">
          <WorkshopsTable
            workshops={workshops as any}
            loading={isFetching}
            onEdit={handleEdit as any}
            onDelete={handleDelete}
            onViewAssignment={handleViewAssignment as any}
            deletingWorkshopId={null}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isAddWorkshopOpen} onOpenChange={setIsAddWorkshopOpen}>
        <DialogContent
          className="max-w-3xl rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8"
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          }
        >
          <AddWorkshopDialog onClose={() => setIsAddWorkshopOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditWorkshopOpen} onOpenChange={setIsEditWorkshopOpen}>
        <DialogContent
          className="max-w-3xl rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8"
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          }
        >
          {selectedWorkshop && (
            <EditWorkshopDialog
              workshop={selectedWorkshop as any}
              onClose={() => setIsEditWorkshopOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteWorkshopDialog
        workshopId={isDeleteWorkshopOpen ? selectedWorkshop?.id || null : null}
        onClose={() => {
          setIsDeleteWorkshopOpen(false);
          setSelectedWorkshop(null);
        }}
      />

      <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
        <DialogContent
          className="max-w-3xl text-black rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8"
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          }
        >
          <AssignmentDialog
            workshop={selectedWorkshop}
            mode={assignmentMode}
            onClose={() => setIsAssignmentOpen(true)}
            onSetMode={setAssignmentMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
