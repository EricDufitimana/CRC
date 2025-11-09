import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/supabase-queries';

export async function GET() {
  try {
    console.log('[Gallery Debug] API Route: /api/events/upcoming - Starting request');
    const events = await getUpcomingEvents();
    
    console.log('[Gallery Debug] API Route: Received', events?.length || 0, 'events');
    
    // Log each event's gallery data
    events?.forEach((event: any, index: number) => {
      console.log(`[Gallery Debug] API Route: Event ${index + 1} - "${event.title}":`, {
        id: event.id,
        gallery_folder: event.gallery_folder,
        gallery_images: event.gallery_images,
        gallery_images_length: event.gallery_images?.length || 0,
        gallery: event.gallery,
        gallery_length: event.gallery?.length || 0
      });
    });
    
    const response = { events: events || [] };
    console.log('[Gallery Debug] API Route: Sending response with', response.events.length, 'events');
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Gallery Debug] API Route: Error fetching upcoming events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 