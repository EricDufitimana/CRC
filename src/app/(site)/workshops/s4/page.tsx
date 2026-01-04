"use client";
import { useState } from "react";
import WorkshopsNotificationBanner from "@/components/Banner/WorkshopsNotificationBanner";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  presentation_url: string | null;
  google_slide_url: string | null;
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    submission_idate: string;
    submission_style: string;
  }>;
  crc_classes?: Array<{
    id: string;
    name: string;
  }>;
}

export default function S4WorkshopsPage() {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const trpc = useTRPC();
  
  const { data: workshopsData, isLoading: loading } = useSuspenseQuery(
    trpc.workshops.getWorkshopsByGroup.queryOptions({ group: 'senior_4' })
  );
  
  const workshops = workshopsData?.data || [];

  const toggleCard = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-[150px]">
      <WorkshopsNotificationBanner page="s4_workshops" theme="green" />
      <h1 className="text-3xl font-bold text-center">CRC Workshops Recap</h1>
      <p className="text-muted-foreground text-center">A timeline of workshops, presentations, and assignments for Senior 4 students.</p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse ml-4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
        {workshops.map((workshop, i) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            index={i}
            expandedCards={expandedCards}
            onToggleCard={toggleCard}
            formatDate={formatDate}
          />
        ))}
        </div>
      )}

      {!loading && workshops.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <Image
              src="/images/empty-state/empty-state-workshops.svg"
              alt="No workshops"
              width={256}
              height={256}
              className="h-64 w-64 mx-auto"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workshops Found</h3>
          <p className="text-gray-500">There are currently no workshops available for Senior 4 students.</p>
        </div>
      )}
    </main>
  );
}
