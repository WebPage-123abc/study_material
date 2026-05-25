export async function onRequestGet(context) {
  const { request, env } = context;
  const bucket = env.BUCKET;
  
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  try {
    const object = await bucket.get(key);

    if (object === null) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // Guess content type if none is set
    if (!headers.has('content-type')) {
      if (key.endsWith('.pdf')) headers.set('content-type', 'application/pdf');
      else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) headers.set('content-type', 'image/jpeg');
      else if (key.endsWith('.png')) headers.set('content-type', 'image/png');
      else headers.set('content-type', 'application/octet-stream');
    }

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return new Response('Error retrieving file', { status: 500 });
  }
}
