import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route: send-help-message started');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const { name, email, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Get Supabase URL and anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    console.log('📤 Calling Supabase edge function...');
    
    // Call the Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/send_help_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ name, email, message }),
    });
    
    const data = await response.json();
    console.log('📊 Edge function response:', data);
    
    if (!response.ok) {
      console.error('❌ Edge function error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to send help message' },
        { status: response.status }
      );
    }
    
    console.log('✅ Help message sent successfully');
    return NextResponse.json({ 
      message: 'Help message sent successfully',
      data 
    });
    
  } catch (error) {
    console.error('💥 Error in send-help-message API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
