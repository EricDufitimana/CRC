import { baseProcedure, createTRPCRouter } from '../init';
import { z } from 'zod';
import { getUpcomingEvents, getPreviousEvents } from '@/lib/supabase-queries';

export const eventsRouter = createTRPCRouter({
  getUpcomingEvents: baseProcedure
    .query(async () => {
      console.log('[Gallery Debug] tRPC: Starting to fetch upcoming events');
      const events = await getUpcomingEvents();
      
      console.log('[Gallery Debug] tRPC: Received', events?.length || 0, 'events');
      
      // Log each event's gallery data
      events?.forEach((event: any, index: number) => {
        console.log(`[Gallery Debug] tRPC: Event ${index + 1} - "${event.title}":`, {
          id: event.id,
          gallery_folder: event.gallery_folder,
          gallery_images: event.gallery_images,
          gallery_images_length: event.gallery_images?.length || 0,
          gallery: event.gallery,
          gallery_length: event.gallery?.length || 0
        });
      });
      
      console.log('[Gallery Debug] tRPC: Sending response with', events?.length || 0, 'events');
      
      return { events: events || [] };
    }),

  getPreviousEvents: baseProcedure
    .query(async () => {
      const events = await getPreviousEvents();
      return { events: events || [] };
    }),
});
