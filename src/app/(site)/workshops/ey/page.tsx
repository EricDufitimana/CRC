// app/workshops/page.tsx
"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PdfViewer from "@/components/PdfViewer/PdfViewer";


export default function WorkshopsPage() {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);

  const toggleCard = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  const workshops = [
    {
      date: "September 18th",
      title: "Intro to the CRC",
      desc: "During this workshop, students were given a thorough introduction to the CRC department and new CRC fellows. Students also discussed what to expect from the CRC, the various resources offered, and what to expect from the CRC workshops during Term 1.",
      presentationUrl: "/pdfs/intro-to-crc.pdf",
      imageUrl: "/images/banners/image.svg",
    },
    {
      date: "September 25th",
      title: "Note Taking Habits",
      desc: "During this workshop, students were taught four different note taking methods and discussed their usage, advantages, and disadvantages. Using one of the methods discussed, take notes on a 4 minute video titled Exploring Afrobeats Dance: Essence, Origins, and Uniqueness",
      presentationUrl: "/pdfs/note-taking.pdf",
      imageUrl: "/images/banners/image.svg",
      assignment: {
        text: "Take notes on 'Exploring Afrobeats Dance'",
        dueDate: "Due: Oct 2nd, 2024",
        link: "/assignments/afrobeats-notes.pdf"
      }
    },
    // add more...
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 pt-[150px]">
      <h1 className="text-3xl font-bold text-center">CRC Workshops Recap</h1>
      <p className="text-muted-foreground text-center">A timeline of workshops, presentations, and assignments for Enrichment Year students.</p>

      <div className="space-y-4">
        {workshops.map((w, i) => {
          const isExpanded = expandedCards.includes(i);
          
          return (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Header - Always visible */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-200 text-green-800 hover:bg-green-200 hover:text-green-800">
                      {w.date}
                    </Badge>
                    <h2 className="font-semibold">{w.title}</h2>
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
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left side - Description and Assignment */}
                    <div className="flex-1 relative h-[300px]">
                      <p className="text-sm text-muted-foreground">{w.desc}</p>

                      {w.assignment && (
                        <div className="absolute bottom-[48px] left-0 right-0 space-y-2">
                          <h3 className="text-sm font-medium">📌 Assignment</h3>
                          <Card className="p-3 shadow-none">
                            <div className="flex flex-col gap-2">
                              <p className="text-muted-foreground text-sm">{w.assignment.text}</p>
                              <Badge className="w-fit bg-dark text-white hover:bg-dark hover:text-white">
                                {w.assignment.dueDate}
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
                    {w.imageUrl && w.presentationUrl && (
                      <div className="sm:w-[250px] flex-shrink-0">
                        <a 
                          href={w.presentationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block"
                        >
                          <Image
                            src={w.imageUrl}
                            alt={`Presentation for ${w.title}`}
                            width={250}
                            height={300}
                            className="rounded-md hover:opacity-90 transition"
                          />
                        </a>
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
