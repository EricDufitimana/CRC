/**
 * Supabase query functions with real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type for subscription callback
type SubscriptionCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}) => void;

// Resource queries - Site pages (only active resources)
export async function getNewOpportunities() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'new_opportunities')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'templates')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEnglishLanguageLearning() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'english_language_learning')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecurringOpportunities() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'recurring_opportunities')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInternships() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'internships')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Admin queries - All resources (active and inactive)
export async function getNewOpportunitiesForAdmin() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'new_opportunities')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTemplatesForAdmin() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'templates')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEnglishLanguageLearningForAdmin() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'english_language_learning')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecurringOpportunitiesForAdmin() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'recurring_opportunities')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecentResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, category, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data;
}

// Event queries (unchanged)
// Helper function to get gallery images from a folder
async function getGalleryImagesFromFolder(folderPath: string | null | undefined): Promise<string[]> {
  if (!folderPath) return [];
  
  try {
    const { data: files, error } = await supabase.storage
      .from('events-gallery')
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error listing gallery images:', error);
      return [];
    }

    if (!files || files.length === 0) return [];

    // Construct public URLs for each image
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return [];

    return files
      .filter(file => file.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
      .map(file => `${supabaseUrl}/storage/v1/object/public/events-gallery/${folderPath}/${file.name}`);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export async function getPreviousEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'previous_events')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Fetch gallery images for each event
  const eventsWithGallery = await Promise.all(
    (data || []).map(async (event) => {
      const galleryImages = await getGalleryImagesFromFolder(event.gallery_folder);
      return {
        ...event,
        gallery_images: galleryImages
      };
    })
  );
  
  return eventsWithGallery;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'upcoming_events')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Fetch gallery images for each event
  const eventsWithGallery = await Promise.all(
    (data || []).map(async (event) => {
      const galleryImages = await getGalleryImagesFromFolder(event.gallery_folder);
      return {
        ...event,
        gallery_images: galleryImages
      };
    })
  );
  
  return eventsWithGallery;
}

export async function getEventsByType(eventType: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', eventType)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Fetch gallery images for each event
  const eventsWithGallery = await Promise.all(
    (data || []).map(async (event) => {
      const galleryImages = await getGalleryImagesFromFolder(event.gallery_folder);
      return {
        ...event,
        gallery_images: galleryImages
      };
    })
  );
  
  return eventsWithGallery;
}

export async function getResourcesByCategory(category: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================
// REAL-TIME SUBSCRIPTION FUNCTIONS
// ============================================

/**
 * Subscribe to changes in resources table filtered by category
 * @param category - The resource category to filter by
 * @param callback - Function to call when changes occur
 * @returns Unsubscribe function
 */
export function subscribeToResourcesByCategory<T = any>(
  category: string,
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel(`resources:category=${category}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resources',
        filter: `category=eq.${category}`,
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to new opportunities changes
 */
export function subscribeToNewOpportunities<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToResourcesByCategory('new_opportunities', callback);
}

/**
 * Subscribe to templates changes
 */
export function subscribeToTemplates<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToResourcesByCategory('templates', callback);
}

/**
 * Subscribe to English language learning resources changes
 */
export function subscribeToEnglishLanguageLearning<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToResourcesByCategory('english_language_learning', callback);
}

/**
 * Subscribe to recurring opportunities changes
 */
export function subscribeToRecurringOpportunities<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToResourcesByCategory('recurring_opportunities', callback);
}

/**
 * Subscribe to internships changes
 */
export function subscribeToInternships<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToResourcesByCategory('internships', callback);
}

/**
 * Subscribe to all resources changes
 */
export function subscribeToAllResources<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel('resources:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resources',
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to events filtered by type
 */
export function subscribeToEventsByType<T = any>(
  eventType: string,
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel(`events:type=${eventType}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `type=eq.${eventType}`,
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to upcoming events
 */
export function subscribeToUpcomingEvents<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToEventsByType('upcoming_events', callback);
}

/**
 * Subscribe to previous events
 */
export function subscribeToPreviousEvents<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  return subscribeToEventsByType('previous_events', callback);
}

/**
 * Subscribe to all events changes
 */
export function subscribeToAllEvents<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel('events:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Admin functions (unchanged)
export async function createResource(resourceData: any) {
  const { data, error } = await supabase
    .from('resources')
    .insert(resourceData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateResource(id: string, updates: any) {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResource(id: string) {
  // Instead of deleting, set status to inactive
  const { error } = await supabase
    .from('resources')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) throw error;
}

export async function reactivateResource(id: string) {
  // Reactivate a resource by setting status to active
  const { error } = await supabase
    .from('resources')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) throw error;
}

export async function createEvent(eventData: any) {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: any) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateEventGalleryFolder(eventId: string, folderPath: string) {
  const { data, error } = await supabase
    .from('events')
    .update({ gallery_folder: folderPath })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEventGalleryImages(eventId: string) {
  const { data: event } = await supabase
    .from('events')
    .select('gallery_folder')
    .eq('id', eventId)
    .single();

  if (!event?.gallery_folder) return [];

  const { data: files, error } = await supabase.storage
    .from('events-gallery')
    .list(event.gallery_folder);

  if (error) return [];
  return files || [];
}

// ============================================
// ADMIN REAL-TIME SUBSCRIPTION FUNCTIONS
// ============================================

/**
 * Subscribe to all resources changes for admin content management
 */
export function subscribeToAllResourcesForAdmin<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel('admin:resources:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resources',
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to all events changes for admin events management
 */
export function subscribeToAllEventsForAdmin<T = any>(
  callback: SubscriptionCallback<T>
): () => void {
  const channel = supabase
    .channel('admin:events:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      (payload: any) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}