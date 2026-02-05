-- KsarApp Database Schema (Enhanced)
-- PostgreSQL Schema for aid/case management system
-- Tracks people requesting help, cases (aid requests), aid types, notes, and history

-- ============================================================================
-- 1. USERS TABLE (Team members / Volunteers)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'coordinator', 'volunteer', 'guest');
CREATE TYPE case_status AS ENUM ('new', 'in_progress', 'completed', 'blocked');
CREATE TYPE urgency_level AS ENUM ('very_urgent', 'urgent', 'normal');
CREATE TYPE contact_method_type AS ENUM ('call', 'whatsapp', 'sms');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'volunteer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. PEOPLE TABLE (People requesting help - NOT team members)
-- ============================================================================

CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  city VARCHAR(100),
  number_of_people INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_people_city ON people(city);
CREATE INDEX IF NOT EXISTS idx_people_full_name ON people(full_name);

-- ============================================================================
-- 3. AID TYPES TABLE (Types of help available)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aid_types (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed aid types
INSERT INTO aid_types (label, description) VALUES
('logement', 'Housing/Accommodation')
ON CONFLICT DO NOTHING;
INSERT INTO aid_types (label, description) VALUES
('nourriture', 'Food/Meals')
ON CONFLICT DO NOTHING;
INSERT INTO aid_types (label, description) VALUES
('vetements', 'Clothing')
ON CONFLICT DO NOTHING;
INSERT INTO aid_types (label, description) VALUES
('medicaments', 'Medication/Medical')
ON CONFLICT DO NOTHING;
INSERT INTO aid_types (label, description) VALUES
('enfants', 'Child Support')
ON CONFLICT DO NOTHING;
INSERT INTO aid_types (label, description) VALUES
('autre', 'Other')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CASES TABLE (Main aid requests)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  status case_status DEFAULT 'new',
  urgency urgency_level DEFAULT 'normal',
  contact_method contact_method_type,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  summary VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_urgency ON cases(urgency);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_person_id ON cases(person_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

-- ============================================================================
-- 5. CASE AID TYPES TABLE (Many-to-many: cases ↔ aid types)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_aid_types (
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  aid_type_id INTEGER NOT NULL REFERENCES aid_types(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, aid_type_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_aid_types_case ON case_aid_types(case_id);
CREATE INDEX IF NOT EXISTS idx_case_aid_types_aid ON case_aid_types(aid_type_id);

-- ============================================================================
-- 6. NOTES TABLE (Follow-up comments & case notes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_case_id ON notes(case_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- ============================================================================
-- 7. CASE HISTORY TABLE (Audit trail for status changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_history (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_history_case_id ON case_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_history_changed_at ON case_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_case_history_changed_by ON case_history(changed_by);

-- ============================================================================
-- 8. ACTIVITY LOGS TABLE (General audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================================================
-- 9. TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. AUTO-LOG STATUS CHANGES (Case history trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_history (case_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS case_status_change_trigger ON cases;
CREATE TRIGGER case_status_change_trigger AFTER UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION log_case_status_change();
