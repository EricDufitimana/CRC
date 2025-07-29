"use client";
import { useState } from "react";
import { Calendar } from "../../../zenith/src/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Badge } from "../../../zenith/src/components/ui/badge";
import { Button } from "../../../zenith/src/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../zenith/src/components/ui/hover-card";
import { Clock, MapPin, Users, Plus } from "lucide-react";
import { format, isSameDay, addDays } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location?: string;
  attendees?: number;
  type: "meeting" | "workshop" | "deadline" | "other";
}
const mockEvents: CalendarEvent[] = [
  { id: "1", title: "Parent-Teacher Conference", date: new Date(), time: "2:00 PM", location: "Room 205", attendees: 3, type: "meeting" },
  { id: "2", title: "College Application Workshop", date: addDays(new Date(), 2), time: "10:00 AM", location: "Auditorium", attendees: 25, type: "workshop" },
  { id: "3", title: "Essay Review Deadline", date: addDays(new Date(), 3), time: "11:59 PM", type: "deadline" },
  { id: "4", title: "Staff Meeting", date: addDays(new Date(), 5), time: "9:00 AM", location: "Conference Room", attendees: 8, type: "meeting" }
];
export function DashboardCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, date));
  };
  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };
  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-primary/10 text-primary";
      case "workshop":
        return "bg-success/10 text-success";
      case "deadline":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const selectedDateEvents = getEventsForDate(selectedDate);
  return <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          <Button size="sm" className="text-primary-foreground bg-black">
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar 
          mode="single" 
          selected={date} 
          onSelect={newDate => {
            setDate(newDate);
            if (newDate) setSelectedDate(newDate);
          }} 
          className="rounded-md border pointer-events-auto" 
          modifiers={{
            hasEvents: date => {
              // Validate that date is a valid Date object
              if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return false;
              }
              return hasEventsOnDate(date);
            }
          }} 
          modifiersStyles={{
            hasEvents: {
              position: "relative"
            }
          }}
          classNames={{
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative [&[data-has-events=true]]:after:content-[''] [&[data-has-events=true]]:after:absolute [&[data-has-events=true]]:after:bottom-1 [&[data-has-events=true]]:after:left-1/2 [&[data-has-events=true]]:after:transform [&[data-has-events=true]]:after:-translate-x-1/2 [&[data-has-events=true]]:after:w-1.5 [&[data-has-events=true]]:after:h-1.5 [&[data-has-events=true]]:after:bg-primary [&[data-has-events=true]]:after:rounded-full",
            day_selected: "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />

        {/* Events for selected date */}
        {selectedDateEvents.length > 0 && <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">
              Events on {format(selectedDate, "MMMM d, yyyy")}
            </h4>
            
            <div className="space-y-2">
              {selectedDateEvents.map(event => <HoverCard key={event.id}>
                  <HoverCardTrigger asChild>
                    <div className="p-3 bg-card border border-border rounded-lg cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground">
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                            {event.location && <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>}
                          </div>
                        </div>
                        
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(event.date, "EEEE, MMMM d")} at {event.time}
                        </div>
                        {event.location && <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>}
                        {event.attendees && <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {event.attendees} attendees
                          </div>}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>)}
            </div>
          </div>}
      </CardContent>
    </Card>;
} 