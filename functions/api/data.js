export async function onRequest(context) {
  const { env } = context;
  const db = env.DB; // This matches the binding in wrangler.toml

  try {
    // 1. Fetch Subjects
    const { results: subjects } = await db.prepare("SELECT * FROM subjects ORDER BY order_index ASC").all();
    
    // 2. Fetch Units
    const { results: units } = await db.prepare("SELECT * FROM units ORDER BY order_index ASC").all();
    
    // 3. Fetch Resources
    const { results: resources } = await db.prepare("SELECT * FROM resources ORDER BY order_index ASC").all();

    // Reconstruct the nested JSON structure expected by the frontend
    const structuredSubjects = subjects.map(subject => {
      const subjectUnits = units.filter(u => u.subject_id === subject.id);
      
      const structuredUnits = subjectUnits.map(unit => {
        const unitResources = resources.filter(r => r.unit_id === unit.id);
        
        // Group resources by category
        const categorizedResources = {};
        unitResources.forEach(res => {
          if (!categorizedResources[res.category]) {
            categorizedResources[res.category] = [];
          }
          categorizedResources[res.category].push({
            title: res.title,
            description: res.description,
            url: res.url,
            isUploadedFile: res.is_uploaded_file === 1,
            fileKey: res.file_key
          });
        });

        return {
          id: unit.id,
          title: unit.title,
          description: unit.description,
          resources: categorizedResources
        };
      });

      return {
        id: subject.id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        color: subject.color,
        units: structuredUnits
      };
    });

    // Construct final response
    const payload = {
      meta: {
        studentName: "StudyHub Student",
        semester: "Current Semester",
        lastUpdated: new Date().toISOString()
      },
      subjects: structuredSubjects
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
