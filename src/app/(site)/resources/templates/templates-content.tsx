'use client';

import { ResourceContent } from '@/components/resources/ResourceContent';

export function TemplatesContent() {
  return (
    <ResourceContent 
      category="templates"
      title="Templates"
      description="Access helpful document templates and samples to jumpstart your projects and applications."
      emptyHeader="No templates available"
      emptySubtext="We're currently uploading helpful templates for your applications. Please check back shortly."
    />
  );
}
