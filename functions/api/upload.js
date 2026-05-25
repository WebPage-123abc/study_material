export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.DB;
  const bucket = env.BUCKET;

  try {
    const formData = await request.formData();
    
    const unitId = formData.get('unit_id');
    const category = formData.get('category');
    const title = formData.get('title');
    const description = formData.get('description') || '';
    const file = formData.get('file');

    if (!unitId || !category || !title || !file) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
    }

    // 1. Generate unique file key for R2
    const fileExtension = file.name.split('.').pop();
    const fileKey = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // 2. Upload to R2 Bucket
    await bucket.put(fileKey, file);

    // 3. Save to D1 Database
    const resId = `res_${Math.random().toString(36).substring(2, 10)}`;
    const url = `/api/download?key=${fileKey}`; // We will create this download endpoint next

    await db.prepare(`
      INSERT INTO resources (id, unit_id, category, title, description, url, is_uploaded_file, file_key, order_index)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, 999)
    `).bind(resId, unitId, category, title, description, url, fileKey).run();

    return new Response(JSON.stringify({ success: true, fileKey, url }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
