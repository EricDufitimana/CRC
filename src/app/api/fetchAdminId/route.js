import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch admin data', 
        details: error.message 
      }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json({ 
        error: 'Admin not found for this user' 
      }, { status: 404 });
    }

    console.log('🔍 Admin ID from database:', admin.id, 'Type:', typeof admin.id);
    return NextResponse.json({ adminId: admin.id.toString() });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}