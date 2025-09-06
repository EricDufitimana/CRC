'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submission_idate: string;
}

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  presentation_url?: string;
  assignments?: Assignment[];
  crc_classes?: Array<{ name: string }>;
}

interface WorkshopCardProps {
  workshop: Workshop;
  index: number;
  expandedCards: number[];
  onToggleCard: (index: number) => void;
  formatDate: (dateString: string) => string;
  variant?: 'default' | 'detailed';
}

export default function WorkshopCard({
  workshop,
  index,
  expandedCards,
  onToggleCard,
  formatDate
}: WorkshopCardProps) {
  const isExpanded = expandedCards.includes(index);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-200 text-green-800 hover:bg-green-200 hover:text-green-800">
              {formatDate(workshop.date)}
            </Badge>
            <h2 className="font-semibold">{workshop.title}</h2>
          </div>
          
          <button
            onClick={() => onToggleCard(index)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Expandable content */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="flex flex-col sm:flex-row gap-8 min-h-[200px]">
            {/* Left side - Description and Assignment */}
            <div className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">{workshop.description}</p>

              {workshop.assignments && workshop.assignments.length > 0 && (
                <div className="mt-4 pt-4 ">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Assignment</h3>
                  {workshop.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{assignment.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Due: {formatDate(assignment.submission_idate)}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs">
                          Submit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Presentation */}
            {workshop.presentation_url && (
              <div className="sm:w-[250px] flex-shrink-0 flex">
                <a 
                  href={workshop.presentation_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full h-full"
                >
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-md p-4 h-full min-h-[200px] flex flex-col justify-center items-center text-center hover:bg-gray-50 transition">
                    <div className="text-gray-500 mb-2 text-2xl">📄</div>
                    <p className="text-sm font-medium text-gray-700">View Presentation</p>
                    <p className="text-xs text-gray-500 mt-1">Click to open PDF</p>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
