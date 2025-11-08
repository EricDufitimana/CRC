import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Verify the request secret
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Log what triggered the webhook
    console.log('Revalidation triggered:', body)

    // Revalidate by tag
    revalidateTag('content')
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now() 
    })
  } catch (err) {
    console.error('Error revalidating:', err)
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: err.message 
    }, { status: 500 })
  }
}
