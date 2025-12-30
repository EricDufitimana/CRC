'use client';

import { Fragment } from 'react';
import Layout from '@/components/other/ResourceLayout';
import { Briefcase } from 'lucide-react';
import { useTRPCRealtime } from '@/hooks/useTRPCRealtime';

type Internship = {
  id: number;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  opportunity_deadline?: string | null;
};

export function InternshipsContent() {
  const { data, isLoading, error, refetch } = useTRPCRealtime<Internship>({
    category: 'internships',
  });

  const loading = isLoading;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading internships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-medium">Error loading internships</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="mb-6">
          <div className="relative">
            <Briefcase className="h-16 w-16 mx-auto text-gray-300" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No internships available</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We&apos;re constantly seeking new internship opportunities for our students. Check back regularly for new openings and partnerships.
        </p>
      </div>
    );
  }

  return (
    <>
      {data.map((item, index) => (
        <Fragment key={item.id.toString()}>
          <Layout
            image={item.image_address || '/images/banners/image.svg'}
            title={item.title}
            description={item.description}
            altText="internship illustration"
            double={false}
            deadline={item.opportunity_deadline?.toString()}
            links={
              item.url ? [{ text: `Apply to ${item.title}`, href: item.url }] : []
            }
          />
          {index < data.length - 1 && (
            <hr className="w-full my-8 border-gray-300" />
          )}
        </Fragment>
      ))}
    </>
  );
}

