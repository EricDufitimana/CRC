import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update the user's profile to mark them as no longer new
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_new_user: false 
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'User marked as completed setup' 
    });

  } catch (error) {
    console.error('Error in mark-user-completed-setup API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
