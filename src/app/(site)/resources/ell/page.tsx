
"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import Layout from "@/components/other/ResourceLayout";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import { Fragment } from "react";
import { getEnglishLanguageLearning, subscribeToEnglishLanguageLearning } from "@/lib/supabase-queries";
import { BookOpen } from "lucide-react";
import { filterExpiredResources } from "@/utils/filterExpiredResources";
import ConditionalHeader from "../../../../components/other/ConditionalHeader";
import { useRealtimeData } from "@/hooks/useRealTimeData";


type EnglishResource = {
  id: number;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  opportunity_deadline?: string;
};

export default function Home() {
  const { data, loading, error, refetch } = useRealtimeData<EnglishResource>({
    fetchFunction: getEnglishLanguageLearning,
    subscribeFunction: subscribeToEnglishLanguageLearning,
    filterFunction: filterExpiredResources,
  });

  return (
    <main>
      <ScrollUp />
      <ConditionalHeader 
        title="English Language Learning" 
        description="Access resources and tools to help improve your English language skills and communication abilities."
        image="/images/banners/english.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner page="english_language_learning" containerWidth="w-[1120px]" maxAnnouncements={3} />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading resources...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <p className="text-lg font-medium">Error loading resources</p>
                  <p className="text-sm">{error.message}</p>
                </div>
                <button 
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {!loading && !error && data && data.length > 0 ? (
              data.map((item, index) => (
                <Fragment key={item.id}>
                  <Layout
                    image={item.image_address || "/images/banners/image.svg"}
                    title={item.title}
                    description={item.description}
                    altText="illustration"
                    double={false}
                    deadline={item.opportunity_deadline}
                    links={
                      item.url
                        ? [{ text: `Go to ${item.title}`, href: item.url }]
                        : [ ]
                    }
                  />
                  {index < data.length - 1 && (
                    <hr className="w-full my-8 border-gray-300" />
                  )}
                </Fragment>
              ))
            ) : !loading && !error ? (
              <div className="text-center text-gray-500 py-12">
                <div className="mb-6">
                  <div className="relative">
                    <BookOpen className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No English learning resources available</h3>
                <p className="text-gray-500 max-w-md mx-auto">We&apos;re constantly adding new resources to help improve your English skills. Check back soon for study materials and learning tools.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
