'use client';

import { ResourceContent } from '@/components/resources/ResourceContent';

export function NewOpportunitiesContent() {
  return (
    <ResourceContent 
      category="new_opportunities"
      title="New Opportunities"
      description="Discover the latest educational and career opportunities carefully curated "
      emptyHeader="No new opportunities available"
      emptySubtext="Fresh opportunities are added regularly. Check back soon for the latest educational prospects."
    />
  );
}
