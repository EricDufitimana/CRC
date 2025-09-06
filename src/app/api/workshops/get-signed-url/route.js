import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ this should stay server-side only
)

export async function POST(request) {
  try {
    console.log('🔍 API: get-signed-url called')
    
    const { filePath, bucket = 'presentation_pdfs', expiresIn = 3600 } = await request.json()
    console.log('📁 Request params:', { filePath, bucket, expiresIn })

    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables')
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase credentials' 
      }, { status: 500 })
    }

    console.log('🔗 Creating signed URL for:', filePath)
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ 
        error: `Storage error: ${error.message}`,
        details: error 
      }, { status: 400 })
    }

    console.log('✅ Signed URL created successfully')
    return NextResponse.json({ 
      signedUrl: data?.signedUrl,
      success: true 
    })
  } catch (error) {
    console.error('❌ Error in get-signed-url API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
