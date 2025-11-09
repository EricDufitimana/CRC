import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if required environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 });
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
      // Check if it's a "not found" error (which should be 404, not 500)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Admin not found for this user' 
        }, { status: 404 });
      }
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

    return NextResponse.json({ adminId: admin.id.toString() });
    
  } catch (error) {
    console.error('❌ Exception in fetchAdminId:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}