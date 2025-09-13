import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('🚀 API Route: send-message started');
  
  try {
    console.log('📥 Parsing request body...');
    const requestBody = await request.json();
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const { name, email, message } = requestBody;
    
    console.log('🔍 Validating fields...');
    console.log('- Name:', name);
    console.log('- Email:', email);
    console.log('- Message length:', message?.length);
    
    // Validate required fields
    if (!name || !email || !message) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 Environment variables:');
    console.log('- Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('- Supabase Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NOT SET');
    console.log('- Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');
    
    if (!supabaseUrl) {
      console.log('❌ Supabase URL not configured');
      return NextResponse.json(
        { error: 'Supabase URL not configured' },
        { status: 500 }
      );
    }

    const functionUrl = `${supabaseUrl}/functions/v1/send_message`;
    console.log('🎯 Calling Supabase edge function:', functionUrl);

    const payload = {
      name,
      email,
      message
    };
    console.log('📦 Payload to send:', JSON.stringify(payload, null, 2));

    // Use service role key for server-to-server communication
    const authToken = supabaseServiceKey || supabaseAnonKey;
    console.log('🔑 Using auth token type:', supabaseServiceKey ? 'Service Role Key' : 'Anon Key');
    
    if (!authToken) {
      console.log('❌ No authentication token available');
      return NextResponse.json(
        { error: 'Supabase authentication not configured' },
        { status: 500 }
      );
    }

    // Call the Supabase edge function
    console.log('⏳ Making request to edge function...');
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('📊 Edge function response status:', response.status);
    console.log('📊 Edge function response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ Edge function returned error status');
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ Error response data:', JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log('❌ Failed to parse error response:', parseError.message);
        const textResponse = await response.text();
        console.log('❌ Raw error response:', textResponse);
        errorData = { message: textResponse };
      }
      
      return NextResponse.json(
        { error: 'Failed to send message', details: errorData, status: response.status },
        { status: response.status }
      );
    }

    console.log('✅ Edge function call successful');
    const result = await response.json();
    console.log('📤 Edge function result:', JSON.stringify(result, null, 2));
    
    console.log('🎉 API Route: send-message completed successfully');
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Unexpected error in send-message API:', error);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error message:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
