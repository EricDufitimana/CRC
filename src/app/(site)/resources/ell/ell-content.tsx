'use client';

import { ResourceContent } from '@/components/resources/ResourceContent';

export function ELLContent() {
  return (
    <ResourceContent 
      category="english_language_learning"
      title="English Language Learning"
      description="Access resources and tools to help improve your English language skills and communication abilities."
      emptyHeader="No language resources available"
      emptySubtext="We're currently curating the best language learning tools for you. Check back soon!"
    />
  );
}
