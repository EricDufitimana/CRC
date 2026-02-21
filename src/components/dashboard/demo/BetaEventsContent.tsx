"use client";

import { useState } from "react";
import { EventsHeader } from "../admin/events-management/EventsHeader";
import { EventsGrid } from "../admin/events-management/EventsGrid";
import { EventsCategorySidebar } from "../admin/events-management/EventsCategorySidebar";
import { showToastError } from "@/components/toasts/ToastError";

const dummyEvents = [
  {
    id: "e1",
    title: "Class of 2024 Graduation Ceremony",
    date: new Date().toISOString(),
    location: "Main Hall",
    category: "previous-events",
    description: "Celebrating our seniors."
  },
  {
    id: "e2",
    title: "Career Fair 2024",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    location: "Campus Plaza",
    category: "upcoming-events",
    description: "Connect with top employers."
  }
];

export function BetaEventsContent() {
  const [selectedCategory, setSelectedCategory] = useState("previous-events");

  const filteredEvents = dummyEvents.filter(e => e.category === selectedCategory);

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="space-y-8 p-8">
      <EventsHeader />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-1">
          <EventsCategorySidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddEventOpen={handleAction}
          />
        </div>

        <div className="md:col-span-4">
          <EventsGrid
            events={filteredEvents as any}
            loading={false}
            onEdit={handleAction}
            onDelete={handleAction}
          />
        </div>
      </div>
    </div>
  );
}
