import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'No userId provided' }, { status: 400 });
    }

    // Check if the user ID matches the specified ID
    const targetUserId = '4a99817a-c56e-4b1c-887d-ee65c71516b9';
    
    if (userId === targetUserId) {
      // Return success response instead of redirect for API call
      return NextResponse.json({ 
        success: true,
        message: 'User is authorized admin',
        redirectTo: '/dashboard/admin'
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Access denied', 
        message: 'User ID does not match required admin ID' 
      }, { status: 403 });
    }

  } catch (error) {
    console.error('Check admin route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An error occurred while checking admin status'
    }, { status: 500 });
  }
}
