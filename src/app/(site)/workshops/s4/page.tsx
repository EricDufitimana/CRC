"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { getS4Workshops } from "@/sanity/lib/queries";
import { Workshop } from "@/types/workshop";
import PdfViewer from "@/components/PdfViewer/PdfViewer";
import WorkshopsNotificationBanner from "@/components/Banner/WorkshopsNotificationBanner";

export default function S4WorkshopsPage() {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await client.fetch(getS4Workshops);
        console.log("Fetched workshops:", data);
        setWorkshops(data);
      } catch (error) {
        console.error("Error fetching workshops:", error);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-[150px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Loading Workshops...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-[150px]">
      <h1 className="text-3xl font-bold text-center">CRC Workshops Recap</h1>
      <p className="text-muted-foreground text-center">A timeline of workshops, presentations, and assignments for Senior 4 students.</p>

      <WorkshopsNotificationBanner page="s4_workshops" theme="green" />
      <div className="space-y-4">
        {workshops.map((workshop, i) => {
          const isExpanded = expandedCards.includes(i);
          
          return (
            <Card key={workshop._id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Header - Always visible */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-200 text-green-800 hover:bg-green-200 hover:text-green-800">
                      {formatDate(workshop.workshop_date)}
                    </Badge>
                    <h2 className="font-semibold">{workshop.title}</h2>
                  </div>
                  
                  <button
                    onClick={() => toggleCard(i)}
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
                  <div className="flex flex-col sm:flex-row justify-between">
                    {/* Left side - Description and Assignment */}
                    <div className="flex-1 relative h-[300px] max-w-xl"> <p className="text-sm text-muted-foreground">{workshop.description}</p>

                      {workshop.assignment && (
                        <div className="absolute bottom-[48px] left-0 right-0 space-y-2">
                          <h3 className="text-sm font-medium">📌 Assignment</h3>
                          <Card className="p-3 shadow-none">
                            <div className="flex flex-col gap-2">
                              <p className="text-muted-foreground text-sm">{workshop.assignment.assignment_description}</p>
                              <Badge className="w-fit bg-dark text-white hover:bg-dark hover:text-white">
                                Due: {formatDate(workshop.assignment.assignment_submission_deadline)}
                              </Badge>
                              <Button className="bg-white text-dark border border-dark hover:bg-dark hover:text-white">
                                Submit
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>

                    {/* Right side - Image */}
                    {workshop.presentation_pdf_url && (
                      <div className="sm:w-[250px] flex-shrink-0">
                        <div className="mb-2 text-xs text-gray-500">
                          PDF URL: {workshop.presentation_pdf_url}
                        </div>
                        <PdfViewer pdfUrl={workshop.presentation_pdf_url} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
