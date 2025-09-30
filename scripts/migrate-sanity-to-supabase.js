#!/usr/bin/env node

/**
 * Migration script to import Sanity data to Supabase
 * This script fetches data from Sanity and imports it to Supabase tables
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from 'next-sanity';

// Initialize Sanity client
const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sanity queries
const getResourcesQuery = `*[_type == "resource"] | order(_createdAt desc) {
  _id, title, description, url, secondary_url, image_address, category, opportunity_deadline, _createdAt
}`;

const getEventsQuery = `*[_type == "events"] | order(_createdAt desc) {
  _id, title, description, type, date, location, category, event_organizer, gallery, _createdAt
}`;

async function migrateResources() {
  console.log('🔄 Fetching resources from Sanity...');
  
  try {
    const resources = await sanityClient.fetch(getResourcesQuery);
    console.log(`✅ Found ${resources.length} resources in Sanity`);

    if (resources.length === 0) {
      console.log('⚠️  No resources found in Sanity');
      return;
    }

    // Transform Sanity data to Supabase format
    const transformedResources = resources.map(resource => ({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      secondary_url: resource.secondary_url || null,
      image_address: resource.image_address || null,
      category: resource.category,
      opportunity_deadline: resource.opportunity_deadline || null,
      created_at: resource._createdAt || new Date().toISOString(),
    }));

    console.log('🔄 Inserting resources into Supabase...');
    
    const { data, error } = await supabase
      .from('resources')
      .insert(transformedResources)
      .select();

    if (error) {
      console.error('❌ Error inserting resources:', error);
      return;
    }

    console.log(`✅ Successfully imported ${data.length} resources to Supabase`);
    
  } catch (error) {
    console.error('❌ Error migrating resources:', error);
  }
}

async function migrateEvents() {
  console.log('🔄 Fetching events from Sanity...');
  
  try {
    const events = await sanityClient.fetch(getEventsQuery);
    console.log(`✅ Found ${events.length} events in Sanity`);

    if (events.length === 0) {
      console.log('⚠️  No events found in Sanity');
      return;
    }

    // Transform and insert events
    for (const event of events) {
      const transformedEvent = {
        title: event.title,
        description: event.description || null,
        type: event.type,
        date: event.date || null,
        location: event.location || null,
        category: event.category || null,
        event_organizer_name: event.event_organizer?.name || null,
        event_organizer_role: event.event_organizer?.role || null,
        event_organizer_image: event.event_organizer?.image || null,
        created_at: event._createdAt || new Date().toISOString(),
      };

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert(transformedEvent)
        .select()
        .single();

      if (eventError) {
        console.error(`❌ Error inserting event ${event.title}:`, eventError);
        continue;
      }

      console.log(`✅ Imported event: ${event.title}`);

      // Handle gallery images if they exist
      if (event.gallery && event.gallery.length > 0) {
        console.log(`🔄 Processing ${event.gallery.length} gallery images for ${event.title}...`);
        
        const galleryItems = event.gallery.map((image, index) => ({
          event_id: eventData.id,
          image_url: image.asset?.url || image.url || '',
          public_id: image.asset?.publicId || null,
          alt_text: image.alt || null,
          is_hero: image.isHero || false,
          sort_order: index,
        }));

        const { error: galleryError } = await supabase
          .from('event_gallery')
          .insert(galleryItems);

        if (galleryError) {
          console.error(`❌ Error inserting gallery for ${event.title}:`, galleryError);
        } else {
          console.log(`✅ Imported ${galleryItems.length} gallery images for ${event.title}`);
        }
      }
    }

    console.log('✅ Events migration completed');
    
  } catch (error) {
    console.error('❌ Error migrating events:', error);
  }
}

async function main() {
  console.log('🚀 Starting Sanity to Supabase migration...');
  console.log('📊 This will import resources and events from Sanity to Supabase');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    console.error('❌ Missing Sanity environment variables');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    await migrateResources();
    await migrateEvents();
    
    console.log('🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Update your application to use Supabase instead of Sanity');
    console.log('   2. Test the new data structure');
    console.log('   3. Update your queries and components');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
