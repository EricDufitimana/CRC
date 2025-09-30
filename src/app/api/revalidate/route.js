import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Optional: Verify the request is from Sanity
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Log what triggered the webhook (optional but helpful for debugging)
    console.log('Revalidation triggered by:', body._type)

    // Option A: Revalidate specific paths
   
    // Option B: Revalidate by tag (more flexible)
    revalidateTag('sanity-content')
    
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
