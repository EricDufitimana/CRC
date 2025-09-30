import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/supabase-queries';

export async function GET() {
  try {
    const events = await getUpcomingEvents();
    
    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching previous events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 