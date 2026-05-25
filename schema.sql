DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE units (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_uploaded_file BOOLEAN DEFAULT 0,
  file_key TEXT,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);
