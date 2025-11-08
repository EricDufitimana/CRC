"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WorkshopsNotificationBanner from "@/components/Banner/WorkshopsNotificationBanner";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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

interface CrcClass {
  id: string;
  name: string;
  grade_group: string | null;
}

export default function S6ClassWorkshopsPage() {
  const params = useParams();
  const classId = (params?.classId as string) || '';
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [crcClass, setCrcClass] = useState<CrcClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CRC class details
        const classResponse = await fetch(`/api/admin/crc-classes`);
        if (!classResponse.ok) {
          throw new Error('Failed to fetch CRC classes');
        }
        const classData = await classResponse.json();
        // Ensure we compare IDs as strings to handle any type mismatches
        const foundClass = classData.classes?.find((c: CrcClass) => String(c.id) === String(classId));
        
        if (!foundClass) {
          console.error('CRC class not found for classId:', classId);
          setLoading(false);
          return;
        }
        
        setCrcClass(foundClass);

        // Fetch workshops for this specific CRC class using the ID
        const workshopsResponse = await fetch(`/api/workshops/fetch-by-crc-class?crcClassId=${classId}`);
        if (!workshopsResponse.ok) {
          throw new Error('Failed to fetch workshops');
        }
        const workshopsData = await workshopsResponse.json();
        
        if (workshopsData.success) {
          setWorkshops(workshopsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId]);

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
      <h1 className="text-3xl font-bold text-center">
        {crcClass ? `${crcClass.name} Workshops` : 'Senior 6 Workshops'}
      </h1>
      <p className="text-muted-foreground text-center">
        {crcClass 
          ? `Specialized workshops designed for ${crcClass.name} students. These sessions focus on advanced skills and knowledge tailored to your specific learning path.`
          : 'Loading...'}
      </p>

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
          <p className="text-gray-500">
            {crcClass 
              ? `There are currently no workshops available for ${crcClass.name} students.`
              : 'There are currently no workshops available.'}
          </p>
        </div>
      )}
    </main>
  );
}

