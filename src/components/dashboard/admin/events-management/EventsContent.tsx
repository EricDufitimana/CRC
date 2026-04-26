"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EventsHeader } from "./EventsHeader";
import { EventsGrid } from "./EventsGrid";
import { EventsCategorySidebar } from "./EventsCategorySidebar";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { AddEventDialog } from "./AddEventDialog";
import { EditEventDialog } from "./EditEventDialog";
import { DeleteEventDialog } from "./DeleteEventDialog";

export function EventsContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("previous-events");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

  const { data: events = [], isFetching } = useQuery({
    ...trpc.eventsManagement.getEvents.queryOptions({ category: selectedCategory }),
    refetchOnWindowFocus: false,
  });

  const handleEdit = (event: any) => {
    setEventToEdit(event);
    setIsEditEventOpen(true);
  };

  const handleDelete = (eventId: string) => {
    setEventIdToDelete(eventId);
    setIsDeleteEventOpen(true);
  };

  return (
    <div className="space-y-8">
      <EventsHeader />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <EventsCategorySidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddEventOpen={() => setIsAddEventOpen(true)}
          />
        </div>

        {/* Main Content */}
        <div className="md:col-span-4">
          <EventsGrid
            events={events}
            loading={isFetching}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
      />

      <EditEventDialog
        open={isEditEventOpen}
        onOpenChange={setIsEditEventOpen}
        event={eventToEdit}
      />

      <DeleteEventDialog
        eventId={eventIdToDelete}
        onClose={() => {
          setIsDeleteEventOpen(false);
          setEventIdToDelete(null);
        }}
      />
    </div>
  );
}
