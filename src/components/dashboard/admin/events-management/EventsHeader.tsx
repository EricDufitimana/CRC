"use client";

export function EventsHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-cal-sans">
            Events Management
          </h1>
          <p className="text-sm text-gray-600">
            Create and manage previous and upcoming events for CRC.
          </p>
        </div>
      </div>
    </div>
  );
}
