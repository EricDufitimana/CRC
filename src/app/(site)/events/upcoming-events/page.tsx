"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { EventCard, EventDetailsModal } from "@/components/Events";
import { useState, useEffect } from "react";
import EventsNotificationBanner from "@/components/Banner/EventsNotificationBanner";

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
const heroImages = [
  "/images/blog/article-author-01.png",
  "/images/blog/article-author-02.png", 
  "/images/blog/article-author-03.png",
  "/images/blog/article-author-04.png"
];

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events/upcoming');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Bleed Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 via-transparent to-orange-200/20"></div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
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
            
            {/* Right Column - Image Grid */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-300/20 rounded-full blur-xl"></div>
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {heroImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Image
                        src={image}
                        alt={`Event preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                ))}
              </div>
              
              {/* Decorative Lines */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-4 left-4 w-16 h-1 bg-orange-300/40 rounded-full"></div>
                <div className="absolute bottom-8 right-8 w-12 h-1 bg-orange-400/40 rounded-full"></div>
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
          <Card className="mx-4 p-8 bg-white/90 backdrop-blur-sm shadow-lg border-0">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured Upcoming Events
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get ready for our most exciting gatherings—discover what's coming up and mark your calendar.
              </p>
            </div>
            
            <EventsNotificationBanner page="upcoming_events" />
            
            {/* Event Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
                events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
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
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500">We don't have any upcoming events scheduled yet. Check back soon for updates!</p>
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