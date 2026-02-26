-- StudySpace D1 Schema
-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Learning Outcomes table
CREATE TABLE IF NOT EXISTS learning_outcomes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Junction table for note <-> LO links (many-to-many)
CREATE TABLE IF NOT EXISTS note_lo_links (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  lo_id TEXT NOT NULL REFERENCES learning_outcomes(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, lo_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_note_lo_links_note ON note_lo_links(note_id);
CREATE INDEX IF NOT EXISTS idx_note_lo_links_lo ON note_lo_links(lo_id);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_code ON learning_outcomes(code);
