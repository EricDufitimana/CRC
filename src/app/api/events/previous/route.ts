import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    const eventsQuery = `*[_type=="events" && type=="previous_events"] | order(_createdAt desc){
      _id, _createdAt, category, date, description, event_organizer, gallery, location, title
    }`;
    
    const events = await client.fetch(eventsQuery);
    
    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching previous events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 