import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
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