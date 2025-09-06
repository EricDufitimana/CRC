"use client";
import { useState, useEffect } from "react";
import WorkshopsNotificationBanner from "@/components/Banner/WorkshopsNotificationBanner";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { Card, CardContent } from "@/components/ui/card";

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  presentation_url?: string;
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

export default function S5CustomerCareWorkshopsPage() {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('/api/workshops/fetch');
        if (!response.ok) {
          throw new Error('Failed to fetch workshops');
        }
        const data = await response.json();
        
        if (data.success) {
          // Filter workshops for S5 Customer Care specifically
          const s5CustomerCareWorkshops = data.data.filter((workshop: Workshop) => 
            workshop.crc_classes?.some(crcClass => 
              crcClass.name === 'S5 Customer Care'
            )
          );
          setWorkshops(s5CustomerCareWorkshops);
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const toggleCard = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-[150px]">
      <WorkshopsNotificationBanner page="s4_workshops" theme="green" />
      <h1 className="text-3xl font-bold text-center">Senior 5 Customer Care Workshops</h1>
      <p className="text-muted-foreground text-center">Specialized workshops designed for Senior 5 Customer Care students. These sessions focus on customer service skills, communication, and professional development.</p>

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
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workshops Found</h3>
          <p className="text-gray-500">There are currently no workshops available for Senior 5 Customer Care students.</p>
        </div>
      )}
    </main>
  );
}
