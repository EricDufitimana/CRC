// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity";
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env.js';

const liveClient = createClient({
  projectId,
  dataset,
  apiVersion: '2025-07-20', // Use specific API version for live content
  useCdn: false, // Live content should not use CDN
});

export const { sanityFetch, SanityLive } = defineLive({ 
  client: liveClient
}); 