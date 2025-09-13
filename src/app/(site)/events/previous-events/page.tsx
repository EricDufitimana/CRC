"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { EventCard, EventDetailsModal } from "@/components/Events";
import { useState, useEffect } from "react";
import EventsNotificationBanner from "@/components/Banner/EventsNotificationBanner";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import SectionTitle from "@/components/Common/SectionTitle";

// Type definition based on Sanity schema
type Event = {
  _id: string;
  _type: "events";
  title: string;
  description: string;
  type: "previous_events" | "upcoming_events";
  date: string; // ISO date string from Sanity
  location: string;
  category: "conference" | "seminar" | "workshop" | "webinar" | "training" | "other";
  gallery: Array<{
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
export default function PreviousEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events/previous?t=' + Date.now());
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events');
        }
        
        setEvents(data.events || []);
        console.log('Fetched events:', data.events);
        
        // Debug gallery images for each event
        data.events?.forEach((event: Event, index: number) => {
          console.log(`Event ${index + 1} - ${event.title}:`);
          console.log('  Gallery length:', event.gallery?.length);
          console.log('  Hero images:', event.gallery?.filter(img => img.isHero).length);
          console.log('  Gallery images:', event.gallery?.map(img => ({
            url: img.asset?.url,
            isHero: img.isHero
          })));
        });
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
        {/* Bleed Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-transparent to-green-200/20"></div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center px-12">
            {/* Left Column - Text Content */}
            <div className="space-y-8 pl-4">
              {/* Tagline */}
              <p className="text-green-700 text-lg font-medium">
                All the memories in one place.
              </p>
              
              {/* Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Discover Our{" "}
                <span className="text-green-600">Past Events</span>
              </h1>
              
              {/* Description */}
              <p className="text-gray-600">
              The Previous Events section highlights our past workshops, mentorship programs, and career guidance sessions. This archive celebrates our students' journeys and the CRC's ongoing commitment to empowering young professionals. 
              </p>
              
            </div>
            
              <div className="relative">
                <div className="relative">
                  <div className="w-full h-[36rem] relative">
                    <Image
                      src={"/images/events/previous-events-image.svg"}
                      alt={`Previous events illustration`}
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


      {/* Featured Past Events Section */}
      <section className="py-20 relative">
        {/* Extended Bleed Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 via-green-50/10 to-green-200/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Card className="mx-4 p-8 bg-white/90 backdrop-blur-sm shadow-lg border-0">

              {/* Section Header */}
              <div className="mb-16">
                <SectionTitle
                  title="Featured Past Events"
                  paragraph="A look back at our most inspiring gatherings—revisit highlights that made our community buzz."
                  center={true}
                />
              </div>
            
              <MultipleAnnouncementsBanner page="previous_events" theme="blue" maxAnnouncements={3} />
            {/* Event Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={{
                      ...event,
                      event_organizer: event.event_organizer ? {
                        ...event.event_organizer,
                        image: event.event_organizer.image?.asset?.url
                      } : undefined
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Previous Events</h3>
                    <p className="text-gray-500">We haven't held any events yet. Check back soon for updates!</p>
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