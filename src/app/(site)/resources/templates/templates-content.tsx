'use client';

import { Fragment } from 'react';
import Layout from '@/components/other/ResourceLayout';
import { FileText, Loader2 } from 'lucide-react';
import { useTRPCRealtime } from '@/hooks/useTRPCRealtime';
import { EmptyState } from '@/components/ui/empty-state';
import { ClimbingBoxLoader } from 'react-spinners';

type Template = {
  id: number;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  secondary_url?: string;
  opportunity_deadline?: string | null;
};

export function TemplatesContent() {
  const { data, isLoading, error, refetch } = useTRPCRealtime<Template>({
    category: 'templates',
  });

  const loading = isLoading;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="scale-75">
          <ClimbingBoxLoader />
        </div>
        <p className="mt-4 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-medium">Error loading templates</p>
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
      <div className="content w-[1100px] max-w-[90%] mx-auto">
        <EmptyState
          image="/images/empty-state/empty-resources.svg"
          headerText="No templates available"
          subtext="We're working on adding helpful document templates and samples. Check back soon for resources to jumpstart your projects."
          imageClassName="-ml-8 w-48 h-48"
          imageSize="custom"
          showDashedBorder={false}
        />
      </div>
    );
  }

  return (
    <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
      {data.map((item, index) => (
        <Fragment key={item.id.toString()}>
          <Layout
            key={item.id.toString()}
            image={item.image_address || '/images/banners/image.svg'}
            title={item.title}
            description={item.description}
            altText="illustration"
            double={true}
            deadline={item.opportunity_deadline?.toString()}
            links={
              item.url && item.secondary_url
                ? [
                    { text: 'Blank Template', href: item.url },
                    { text: 'Sample Template', href: item.secondary_url },
                  ]
                : item.url
                  ? [{ text: 'Go to ${item.title}', href: item.url }]
                  : []
            }
          />
          {index < data.length - 1 && (
            <hr className="w-full my-8 border-gray-300" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

