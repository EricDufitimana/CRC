"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/zenith/components/ui/card";
import { ContentManagementHeader } from "../admin/content-management/ContentManagementHeader";
import { ContentCategorySidebar } from "../admin/content-management/ContentCategorySidebar";
import { ContentTable } from "../admin/content-management/ContentTable";
import { showToastError } from "@/components/toasts/ToastError";

const dummyResources = [
  {
    id: "r1",
    title: "How to Ask for Letters of Recommendation",
    category: "templates",
    is_active: true,
    file_path: "path/to/template.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "r2",
    title: "Summer Internship List 2024",
    category: "new-opportunities",
    is_active: true,
    file_path: "path/to/opps.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "r3",
    title: "Vocab for SAT Reading",
    category: "english-learning",
    is_active: true,
    file_path: "path/to/english.pdf",
    created_at: new Date().toISOString()
  }
];

export function BetaContentManagementContent() {
  const [selectedCategory, setSelectedCategory] = useState("new-opportunities");

  const filteredResources = useMemo(() => {
    return dummyResources.filter(r => r.category === selectedCategory);
  }, [selectedCategory]);

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="p-8 space-y-6">
      <ContentManagementHeader />

      <ContentCategorySidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isAddResourceOpen={false}
        onAddResourceOpenChange={handleAction}
        canAddResource={true}
      />

      <div className="w-full">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="px-0">
            <ContentTable
              resources={filteredResources as any}
              loading={false}
              onEdit={handleAction}
              onDeactivate={handleAction}
              onReactivate={handleAction}
              onDelete={handleAction}
              currentPage={1}
              itemsPerPage={10}
              totalResources={filteredResources.length}
              onPageChange={() => {}}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
