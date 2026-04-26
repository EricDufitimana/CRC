'use client';

import { ResourceContent } from '@/components/resources/ResourceContent';

export function InternshipsContent() {
  return (
    <ResourceContent 
      category="internships"
      title="Internship Opportunities"
      description="Explore internship opportunities available through the Career Resources Center."
      emptyHeader="No internships available"
      emptySubtext="We're constantly seeking new internship opportunities for our students. Check back regularly for new openings and partnerships."
    />
  );
}

