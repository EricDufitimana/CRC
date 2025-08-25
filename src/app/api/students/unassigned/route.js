import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  console.log('🚀 API: Starting to fetch unassigned students...');
  
  try {
    console.log('📋 API: Checking environment variables...');
    console.log('📋 API: SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('📋 API: SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('🔍 API: Querying students table...');
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, student_id')
      .is('user_id', null)
      .order('first_name', { ascending: true });

    console.log('📊 API: Query completed');
    console.log('📊 API: Error:', error);
    console.log('📊 API: Data count:', data ? data.length : 'null');
    console.log('📊 API: First few records:', data ? data.slice(0, 3) : 'null');

    if (error) {
      console.error('❌ API: Error fetching unassigned students:', error);
      return NextResponse.json(
        { error: 'Failed to fetch students', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ API: Successfully returning data');
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('💥 API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
