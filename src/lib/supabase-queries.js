/**
 * Supabase query functions to replace Sanity queries
 * These functions provide the same interface as the Sanity queries
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Resource queries
export async function getNewOpportunities() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'new_opportunities')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'templates')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEnglishLanguageLearning() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'english_language_learning')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecurringOpportunities() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'recurring_opportunities')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInternships() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'internships')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecentResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, category, created_at')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data;
}

// Event queries
export async function getPreviousEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'previous_events')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'upcoming_events')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEventsByType(eventType) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('type', eventType)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Generic resource query by category
export async function getResourcesByCategory(category) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Admin functions for creating/updating resources
export async function createResource(resourceData) {
  const { data, error } = await supabase
    .from('resources')
    .insert(resourceData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateResource(id, updates) {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResource(id) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Admin functions for events
export async function createEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Event gallery folder functions
export async function updateEventGalleryFolder(eventId, folderPath) {
  const { data, error } = await supabase
    .from('events')
    .update({ gallery_folder: folderPath })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEventGalleryImages(eventId) {
  const { data: event } = await supabase
    .from('events')
    .select('gallery_folder')
    .eq('id', eventId)
    .single();

  if (!event?.gallery_folder) return [];

  // List files in the gallery folder from Supabase Storage
  const { data: files, error } = await supabase.storage
    .from('events-gallery')
    .list(event.gallery_folder);

  if (error) return [];
  return files || [];
}
