import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check if user exists in admin table
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // User not found in admin table
        return NextResponse.json({ 
          isAuthorized: false,
          message: 'User not found in admin table'
        });
      } else {
        return NextResponse.json({ 
          error: 'Failed to verify admin access', 
          details: error.message 
        }, { status: 500 });
      }
    }

    if (admin) {
      // User is authorized as admin
      return NextResponse.json({ 
        isAuthorized: true,
        adminId: admin.id,
        message: 'User is authorized as admin'
      });
    } else {
      return NextResponse.json({ 
        isAuthorized: false,
        message: 'User not found in admin table'
      });
    }
    
  } catch (error) {
    console.error('Admin authorization check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
