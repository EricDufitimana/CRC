import { NextResponse } from 'next/server';
import { getPreviousEvents } from '@/lib/supabase-queries';

export async function GET() {
  try {
    const events = await getPreviousEvents();
    
    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching previous events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 