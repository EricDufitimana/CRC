"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { EventCard, EventDetailsModal } from "@/components/Events";
import { useState } from "react";
import EventsNotificationBanner from "@/components/Banner/EventsNotificationBanner";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import SectionTitle from "@/components/Common/SectionTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

// Type definition based on Supabase schema
type Event = {
  id: number;
  title: string;
  description: string;
  type: "previous_events" | "upcoming_events";
  date: string; // ISO date string from Sanity
  location: string;
  category: "conference" | "seminar" | "workshop" | "webinar" | "training" | "other";
  gallery_folder?: string | null;
  gallery_images?: string[];
  gallery?: Array<{
    _key: string;
    _type: "image";
    asset: {
      _id: string;
      url: string;
      metadata: any;
    };
    isHero?: boolean;
  }>;
  event_organizer?: {
    name: string;
    role: string;
    image?: {
      asset: {
        _id: string;
        url: string;
        metadata: any;
      };
    };
  };
  image?: {
    asset: {
      _id: string;
      url: string;
      metadata: any;
    };
  };
}
// Hero section image grid data

export default function UpcomingEventsPage() {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  
  const { data: eventsData, error, isLoading: loading } = useSuspenseQuery(
    trpc.events.getUpcomingEvents.queryOptions()
  );
  
  const events = eventsData?.events || [];



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 ${isMobile ? "pt-[120px]" : ""}`}>
        {/* Bleed Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-transparent to-orange-200/20"></div>
        
        {/* Zigzag circle positioned at screen edge */}
        
        
        <div className={`container mx-auto px-4 py-20 lg:py-32 ${isMobile ? "w-full" : ""}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center px-12">
            {/* Left Column - Text Content */}
            <div className="space-y-8 pl-4">
              {/* Tagline */}
              <p className="text-orange-700 text-lg font-medium">
                Exciting events coming your way.
              </p>
              
              {/* Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Discover Our{" "}
                <span className="text-orange-600">Upcoming Events</span>
              </h1>
              
              {/* Description */}
              <p className="text-gray-600">
              The Upcoming Events section showcases our future workshops, mentorship programs, and career guidance sessions. Stay tuned for exciting opportunities to grow and connect with our community.
              </p>
              
            </div>
            
              <div className={`relative ${isMobile ? "hidden" : ""}`}>
                <div className="relative">
                  <div className="w-full h-[36rem] relative">
                    <Image
                      src={"/images/events/upcoming-events.svg"}
                      alt={`Upcoming events illustration`}
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>


      {/* Featured Upcoming Events Section */}
      <section className="py-20 relative">
        {/* Extended Bleed Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/20 via-orange-50/10 to-orange-200/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Card className="mx-4 p-8 bg-white/90 backdrop-blur-sm shadow-none border border-gray-200">
            {/* Section Header */}
            <div className="mb-16">
              <SectionTitle
                title="Featured Upcoming Events"
                paragraph="Get ready for our most exciting gatherings—discover what's coming up and mark your calendar."
                center={true}
              />
            </div>
            
            <MultipleAnnouncementsBanner page="upcoming_events" theme="orange" maxAnnouncements={3} />
            
            {/* Event Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-neutral-400" />
                  <p className="text-lg text-gray-600">Loading events...</p>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-red-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Events</h3>
                    <p className="text-gray-500 mb-4">Failed to load events. Please try again.</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : events && events.length > 0 ? (
                events.map((event: Event) => {
                  // Process gallery for this event
                  console.log(`[Gallery Debug] Rendering event "${event.title}":`, {
                    has_gallery_images: !!event.gallery_images,
                    gallery_images_length: event.gallery_images?.length || 0,
                    gallery_images: event.gallery_images,
                    has_gallery: !!event.gallery,
                    gallery_length: event.gallery?.length || 0,
                    gallery: event.gallery
                  });
                  
                  // Check if gallery_images exists and has items, otherwise fall back to gallery
                  let processedGallery: Array<{
                    _key: string;
                    _type: "image";
                    asset: {
                      _id: string;
                      url: string;
                      metadata: any;
                    };
                    isHero?: boolean;
                  }> = [];
                  
                  if (event.gallery_images && event.gallery_images.length > 0) {
                    console.log(`[Gallery Debug] Using gallery_images for event "${event.title}"`);
                    processedGallery = event.gallery_images.map((url, index) => {
                      // Check if URL contains "hero-image" to identify hero image
                      const isHero = url.includes('hero-image') || index === 0;
                      const galleryItem = {
                        _key: `img-${index}`,
                        _type: "image" as const,
                        asset: {
                          _id: `asset-${index}`,
                          url: url,
                          metadata: {}
                        },
                        isHero: isHero
                      };
                      console.log(`[Gallery Debug] Processing gallery_images[${index}] for event "${event.title}":`, galleryItem);
                      return galleryItem;
                    });
                  } else if (event.gallery && event.gallery.length > 0) {
                    console.log(`[Gallery Debug] Using gallery array for event "${event.title}"`);
                    processedGallery = event.gallery;
                  } else {
                    console.log(`[Gallery Debug] No gallery data available for event "${event.title}"`);
                  }
                  
                  console.log(`[Gallery Debug] Final processed gallery for event "${event.title}":`, {
                    source: event.gallery_images && event.gallery_images.length > 0 ? 'gallery_images' : event.gallery && event.gallery.length > 0 ? 'gallery' : 'empty',
                    gallery_length: processedGallery.length,
                    gallery: processedGallery
                  });
                  
                  return (
                    <EventCard
                      key={event.id}
                      event={{
                        _id: String(event.id),
                        _type: "events",
                        title: event.title,
                        description: event.description,
                        type: event.type,
                        date: event.date,
                        location: event.location,
                        category: event.category,
                        gallery: processedGallery,
                        event_organizer: event.event_organizer ? {
                          name: event.event_organizer.name,
                          role: event.event_organizer.role,
                          image: typeof event.event_organizer.image === 'string' 
                            ? event.event_organizer.image 
                            : event.event_organizer.image?.asset?.url
                        } : undefined
                      }}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 flex justify-center">
                      <Image
                        src="/images/empty-state/empty-state-events.svg"
                        alt="No upcoming events"
                        width={256}
                        height={256}
                        className="h-64 w-64 mx-auto"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500">We don&apos;t have any upcoming events scheduled yet. Check back soon for updates!</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
} 