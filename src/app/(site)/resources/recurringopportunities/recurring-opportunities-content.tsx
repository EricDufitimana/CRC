'use client';

import { ResourceContent } from '@/components/resources/ResourceContent';

export function RecurringOpportunitiesContent() {
  return (
    <ResourceContent 
      category="recurring_opportunities"
      title="Recurring Opportunities"
      description="Explore ongoing and recurring opportunities available through the Career Resources Center."
      emptyHeader="No recurring opportunities available"
      emptySubtext="Stay tuned! We regularly update this section with recurring educational and career programs."
    />
  );
}
