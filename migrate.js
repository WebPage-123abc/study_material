import fs from 'fs';
import path from 'path';

// Read the JSON data
const dataPath = path.resolve('data/data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

let sql = '';

// Helper to escape single quotes in SQL strings
const escapeSql = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
};

// Generate UUID-like strings for resource IDs (since JSON didn't have them)
const generateId = () => Math.random().toString(36).substring(2, 10);

data.subjects.forEach((subject, sIdx) => {
  // Insert Subject
  sql += `INSERT INTO subjects (id, name, description, icon, color, order_index) VALUES ('${escapeSql(subject.id)}', '${escapeSql(subject.name)}', '${escapeSql(subject.description)}', '${escapeSql(subject.icon)}', '${escapeSql(subject.color)}', ${sIdx});\n`;

  subject.units.forEach((unit, uIdx) => {
    // Insert Unit
    sql += `INSERT INTO units (id, subject_id, title, description, order_index) VALUES ('${escapeSql(unit.id)}', '${escapeSql(subject.id)}', '${escapeSql(unit.title)}', '${escapeSql(unit.description)}', ${uIdx});\n`;

    // Resources are grouped by category
    if (unit.resources) {
      Object.entries(unit.resources).forEach(([category, resourcesArray]) => {
        resourcesArray.forEach((res, rIdx) => {
          const resId = `res_${generateId()}`;
          const isUploaded = 0;
          const fileKey = '';
          sql += `INSERT INTO resources (id, unit_id, category, title, description, url, is_uploaded_file, file_key, order_index) VALUES ('${resId}', '${escapeSql(unit.id)}', '${escapeSql(category)}', '${escapeSql(res.title)}', '${escapeSql(res.description || '')}', '${escapeSql(res.url)}', ${isUploaded}, '${fileKey}', ${rIdx});\n`;
        });
      });
    }
  });
});

fs.writeFileSync('seed.sql', sql);
console.log('Successfully created seed.sql from data.json!');
