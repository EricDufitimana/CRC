import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get('admin_id');
  
  if (!adminId) {
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('admin')
      .select('honorific, first_name, last_name, email')
      .eq('id', adminId)
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
