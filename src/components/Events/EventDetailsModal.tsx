"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Bookmark, 
  ArrowRight,
  ExternalLink,
  Mail,
  Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselIndicator,
} from "@/components/ui/carousel";

import { urlFor } from '@/sanity/lib/image';

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

interface EventDetailsModalProps {
  event: SanityEvent;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const [api, setApi] = React.useState<any>();

  // Debug logging
  console.log('EventDetailsModal - Event:', event);
  console.log('EventDetailsModal - Gallery:', event.gallery);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workshop: "bg-blue-100 text-blue-800 border-blue-200",
      conference: "bg-purple-100 text-purple-800 border-purple-200",
      seminar: "bg-green-100 text-green-800 border-green-200",
      networking: "bg-orange-100 text-orange-800 border-orange-200",
      training: "bg-indigo-100 text-indigo-800 border-indigo-200",
      webinar: "bg-purple-100 text-purple-800 border-purple-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Convert gallery images to URLs with proper error handling
  const galleryImages = event.gallery?.map(img => {
    if (img.asset) {
      try {
        // For upcoming events, use direct URL if available, otherwise use Sanity URL
        if (img.asset.url && img.asset.url.startsWith('http')) {
          return img.asset.url;
        }
        return urlFor(img.asset).url();
      } catch (error) {
        console.error('Error processing image:', error);
        return null;
      }
    }
    return null;
  }).filter(url => url !== null) || [];
  const eventDate = new Date(event.date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 bg-white z-[9999]">
        <DialogTitle className="sr-only">Event Details</DialogTitle>
        <div className="grid lg:grid-cols-3 gap-0">
                    {/* Left Panel - Image Display */}
          <div className="lg:col-span-2 relative h-full px-1">
            {galleryImages.length === 1 ? (
              // Single image when only one image in gallery
              <div className="w-full h-full rounded-lg overflow-hidden py-1">
                <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden p-2">
                  <Image
                    src={galleryImages[0]}
                    alt={`${event.title} - Main Image`}
                    fill
                    className="object-contain object-center rounded-lg"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            ) : (
              // Carousel when multiple images or no images
              <Carousel
                setApi={setApi}
                className="w-full h-full rounded-lg overflow-hidden"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="h-[90vh] py-1">
                  {galleryImages.length > 0 ? (
                    galleryImages.map((imageUrl, index) => (
                      <CarouselItem key={index} className="pl-0">
                        <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden p-2">
                          <Image
                            src={imageUrl}
                            alt={`${event.title} - Image ${index + 1}`}
                            fill
                            className="object-cover object-center rounded-lg"
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem className="pl-0">
                      <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden p-2 flex items-center justify-center">
                        <p className="text-gray-500">No images available</p>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                
                {/* Navigation Controls */}
                <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-0 shadow-lg" />
                <CarouselNext className="right-4 bg-white/80 hover:bg-white border-0 shadow-lg" />
              </Carousel>
            )}
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-1 p-6 lg:p-8 bg-white">
            <div className="h-full flex flex-col">
              {/* Header Section */}
              <div className="mb-6 h-short:mb-2">
                <Badge 
                  variant="outline" 
                  className={`${getCategoryColor(event.category)} border`}
                >
                  {event.category}
                </Badge>
                
                <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-4 leading-tight h-short:text-xl ">
                  {event.title}
                </DialogTitle>
                
                <div className="space-y-3 h-short:space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{event.location}</span>
                  </div>
                  
                  
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-6 overflow-hidden">
                {/* Description */}
                <div className="overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 h-short:text-base">
                    About This Event
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed overflow-hidden h-short:text-sm">
                    {event.description}
                  </p>
                </div>

                {/* Key Details */}
                       {/* Organizer */}
                {event.event_organizer && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 h-short:text-base">
                      Event Organizer
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 h-short:h-10 h-short:w-10">
                        <AvatarImage 
                          src={event.event_organizer.image || undefined} 
                          alt={event.event_organizer.name} 
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {event.event_organizer.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 h-short:text-sm">{event.event_organizer.name}</p>
                        {event.event_organizer.role && (
                          <p className="text-sm text-gray-600 h-short:text-xs">{event.event_organizer.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div> 
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 