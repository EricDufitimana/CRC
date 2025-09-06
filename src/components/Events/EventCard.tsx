"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { urlFor } from '@/sanity/lib/image';
import { EventDetailsModal } from './EventDetailsModal';

// Sanity Event type definition
type SanityEvent = {
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
    image?: string;
  };
  image?: {
    asset: {
      _id: string;
      url: string;
      metadata: any;
    };
  };
}

interface EventCardProps {
  event: SanityEvent;
  onViewDetails?: (event: SanityEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get the hero image from gallery (isHero: true) as the cover image
  const heroImageAsset = event.gallery?.find(img => img.isHero)?.asset;
  const firstImageAsset = event.gallery?.[0]?.asset;
  const eventImageAsset = heroImageAsset || firstImageAsset || event.image?.asset;
  
  // Convert Sanity image asset to URL
  let eventImageUrl = "/images/blog/blog-01.jpg";
  if (eventImageAsset) {
    try {
      // For upcoming events, use direct URL if available, otherwise use Sanity URL
      if (eventImageAsset.url && eventImageAsset.url.startsWith('http')) {
        eventImageUrl = eventImageAsset.url;
      } else {
        eventImageUrl = urlFor(eventImageAsset).url();
      }
    } catch (error) {
      console.error('Error processing image:', error);
      eventImageUrl = "/images/blog/blog-01.jpg";
    }
  }
  
  // Debug logging
  console.log(`Event: ${event.title}`);
  console.log('Gallery:', event.gallery);
  console.log('Hero image asset:', heroImageAsset);
  console.log('First image asset:', firstImageAsset);
  console.log('Final image URL:', eventImageUrl);

  // Format the date
  const eventDate = new Date(event.date);

  const handleViewDetails = () => {
    setIsModalOpen(true);
    onViewDetails?.(event);
  };

  return (
    <Card className="group transition-all duration-300 border border-neutral-200 flex flex-col h-full">
      
      {/* Event Image */}
      <div className="p-4">
        <div className="relative h-48 overflow-hidden rounded-md">
          <Image
            src={eventImageUrl}
            alt={event.title}
            fill
            priority
            className="object-cover transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </div>
      </div>
      
      <CardHeader className="pb-2 flex-1">
        {/* Event Title */}
        <CardTitle className="text-xl font-bold text-gray-900 transition-colors line-clamp-2">
          {event.title}
        </CardTitle>
      </CardHeader>
      
      <div className="px-6 pb-4 mt-auto">
        {/* Date & Venue */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="flex-shrink-0">{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="flex-shrink-0">•</span>
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate" title={event.location}>{event.location}</span>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full border-dark text-dark hover:bg-dark hover:border-dark hover:text-white transition-all duration-300"
          onClick={handleViewDetails}
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4 text-dark hover:text-white" />
        </Button>
      </div>
      
      {/* Event Details Modal */}
      <EventDetailsModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}; 