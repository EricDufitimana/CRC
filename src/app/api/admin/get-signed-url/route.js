import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { filePath, bucket = 'submissions', expiresIn = 3600 } = await request.json();

    if (!filePath) {
      return Response.json({ error: 'File path is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error in get-signed-url API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
