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
  console.log('[Gallery Debug] getGalleryImagesFromFolder called with folderPath:', folderPath);
  
  if (!folderPath) {
    console.log('[Gallery Debug] No folder path provided, returning empty array');
    return [];
  }
  
  try {
    console.log('[Gallery Debug] Listing files from storage bucket "events-gallery" in folder:', folderPath);
    const { data: files, error } = await supabase.storage
      .from('events-gallery')
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('[Gallery Debug] Error listing gallery images:', error);
      return [];
    }

    console.log('[Gallery Debug] Files found:', files?.length || 0);
    if (files && files.length > 0) {
      console.log('[Gallery Debug] Raw file objects:', JSON.stringify(files, null, 2));
      console.log('[Gallery Debug] File names:', files.map(f => f.name));
      console.log('[Gallery Debug] File details:', files.map(f => ({
        name: f.name,
        nameType: typeof f.name,
        nameLength: f.name?.length,
        hasName: !!f.name,
        id: f.id,
        metadata: f.metadata,
        updated_at: f.updated_at
      })));
    }

    if (!files || files.length === 0) {
      console.log('[Gallery Debug] No files found, returning empty array');
      return [];
    }

    // Construct public URLs for each image
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('[Gallery Debug] NEXT_PUBLIC_SUPABASE_URL is not set');
      return [];
    }

    // Test the regex pattern and mimetype check
    const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
    const imageMimeTypeRegex = /^image\/(jpeg|jpg|png|gif|webp)$/i;
    console.log('[Gallery Debug] Testing regex pattern:', imageExtensionRegex.toString());
    console.log('[Gallery Debug] Testing mimetype pattern:', imageMimeTypeRegex.toString());
    
    // Log which files match and which don't
    files.forEach((file, index) => {
      const hasName = !!file.name;
      const matchesExtensionRegex = file.name ? imageExtensionRegex.test(file.name) : false;
      const matchesMimeType = file.metadata?.mimetype ? imageMimeTypeRegex.test(file.metadata.mimetype) : false;
      const isImage = matchesExtensionRegex || matchesMimeType;
      console.log(`[Gallery Debug] File ${index + 1}:`, {
        name: file.name,
        hasName,
        matchesExtensionRegex,
        matchesMimeType,
        mimetype: file.metadata?.mimetype,
        isImage
      });
    });

    const imageFiles = files.filter(file => {
      // Check if it's a folder (folders typically don't have an id or have metadata indicating they're folders)
      const isFolder = !file.id || (file.metadata && file.metadata.mimetype === null);
      const hasName = !!file.name;
      // Check both file extension and mimetype to support files with or without extensions
      const matchesExtensionRegex = file.name ? imageExtensionRegex.test(file.name) : false;
      const matchesMimeType = file.metadata?.mimetype ? imageMimeTypeRegex.test(file.metadata.mimetype) : false;
      const isImage = matchesExtensionRegex || matchesMimeType;
      const result = !isFolder && hasName && isImage;
      
      if (!result && file.name) {
        console.log(`[Gallery Debug] File "${file.name}" filtered out:`, {
          isFolder,
          hasName,
          matchesExtensionRegex,
          matchesMimeType,
          mimetype: file.metadata?.mimetype,
          id: file.id,
          metadata: file.metadata
        });
      }
      return result;
    });
    console.log('[Gallery Debug] Image files after filtering:', imageFiles.length);
    if (imageFiles.length > 0) {
      console.log('[Gallery Debug] Filtered image file names:', imageFiles.map(f => f.name));
    } else {
      console.log('[Gallery Debug] WARNING: No files passed the filter! All files:', files.map(f => ({ name: f.name, type: typeof f.name })));
    }
    
    // Separate hero image from other images
    const heroImageFile = imageFiles.find(file => file.name === 'hero-image' || file.name.startsWith('hero-image'));
    const otherImageFiles = imageFiles.filter(file => file.name !== 'hero-image' && !file.name.startsWith('hero-image'));
    
    // Sort other images by name to ensure consistent ordering
    otherImageFiles.sort((a, b) => {
      if (!a.name || !b.name) return 0;
      return a.name.localeCompare(b.name);
    });
    
    // Build URL array with hero image first (if it exists), then other images
    const imageUrls: string[] = [];
    if (heroImageFile) {
      const heroUrl = `${supabaseUrl}/storage/v1/object/public/events-gallery/${folderPath}/${heroImageFile.name}`;
      imageUrls.push(heroUrl);
      console.log('[Gallery Debug] Hero image found:', heroImageFile.name);
    }
    
    // Add other images
    otherImageFiles.forEach(file => {
      const url = `${supabaseUrl}/storage/v1/object/public/events-gallery/${folderPath}/${file.name}`;
      imageUrls.push(url);
    });
    
    console.log('[Gallery Debug] Generated image URLs (hero first):', imageUrls);
    console.log('[Gallery Debug] Hero image URL:', imageUrls[0] || 'none');
    
    return imageUrls;
  } catch (error) {
    console.error('[Gallery Debug] Error fetching gallery images:', error);
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
  console.log('[Gallery Debug] getUpcomingEvents: Starting to fetch events from database');
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'upcoming_events')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Gallery Debug] getUpcomingEvents: Database error:', error);
    throw error;
  }
  
  console.log('[Gallery Debug] getUpcomingEvents: Found', data?.length || 0, 'events');
  
  // Fetch gallery images for each event
  const eventsWithGallery = await Promise.all(
    (data || []).map(async (event, index) => {
      console.log(`[Gallery Debug] getUpcomingEvents: Processing event ${index + 1}/${data?.length || 0}:`, {
        id: event.id,
        title: event.title,
        gallery_folder: event.gallery_folder,
        has_gallery: !!event.gallery,
        gallery_length: event.gallery?.length || 0
      });
      
      const galleryImages = await getGalleryImagesFromFolder(event.gallery_folder);
      
      console.log(`[Gallery Debug] getUpcomingEvents: Event "${event.title}" - gallery_images count:`, galleryImages.length);
      
      return {
        ...event,
        gallery_images: galleryImages
      };
    })
  );
  
  console.log('[Gallery Debug] getUpcomingEvents: Returning', eventsWithGallery.length, 'events with gallery data');
  
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