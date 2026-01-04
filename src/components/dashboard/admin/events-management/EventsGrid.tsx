"use client";

import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Trash2, Calendar, MapPin, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Skeleton } from "@/zenith/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/zenith/components/ui/dropdown-menu";

type SupabaseEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  type: "previous_events" | "upcoming_events";
  gallery_folder?: string | null;
  gallery?: any[];
  gallery_images?: string[];
  event_organizer_name?: string | null;
  event_organizer_role?: string | null;
  event_organizer_image?: string | null;
};

interface EventsGridProps {
  events: SupabaseEvent[];
  loading: boolean;
  onEdit: (event: SupabaseEvent) => void;
  onDelete: (eventId: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    conference: "bg-blue-50 text-blue-700 border-blue-200",
    seminar: "bg-emerald-50 text-emerald-700 border-emerald-200",
    workshop: "bg-purple-50 text-purple-700 border-purple-200",
    webinar: "bg-amber-50 text-amber-700 border-amber-200",
    training: "bg-rose-50 text-rose-700 border-rose-200",
    other: "bg-gray-50 text-gray-700 border-gray-200"
  };
  return colors[category as keyof typeof colors] || colors.other;
};

const getEventImage = (event: SupabaseEvent) => {
  try {
    if (event.gallery_images && event.gallery_images.length > 0) {
      const heroImageUrl = event.gallery_images.find(url => url.includes('hero-image'));
      return heroImageUrl || event.gallery_images[0];
    }
    const heroImage = event.gallery?.find((img: any) => img.isHero)?.asset;
    if (heroImage && heroImage.url) return heroImage.url;

    const firstImage = event.gallery?.[0]?.asset;
    if (firstImage && firstImage.url) return firstImage.url;

    if (event.event_organizer_image) return event.event_organizer_image;

    return null;
  } catch (error) {
    console.error('Error processing event image:', error);
    return null;
  }
};

export function EventsGrid({
  events,
  loading,
  onEdit,
  onDelete,
}: EventsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="relative w-40 h-40 mb-6 ml-8 opacity-50 grayscale">
          <Image
            src="/images/empty-state/empty-events.svg"
            alt="No events"
            fill
            className="object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No events found</h3>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Pass events are managed automatically. Add new events to keep things up to date.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const eventImage = getEventImage(event);
        return (
          <Card key={event.id} className="group flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
            <div className="relative h-48 w-full border-b border-gray-100 bg-gray-50">
              {eventImage ? (
                <Image
                  src={eventImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white">
                      <MoreHorizontal className="h-4 w-4 text-gray-700" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit(event)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(event.id.toString())} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className={`${getCategoryColor(event.category)} border px-2.5 py-0.5 text-xs font-medium rounded-md shadow-sm`}>
                  {event.category}
                </Badge>
              </div>
            </div>

            <CardContent className="flex-1 p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-1" title={event.title}>
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 mt-auto border-t border-gray-50 bg-gray-50/50">
              <div className="w-full pt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {format(new Date(event.date), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1.5 max-w-[50%]">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
