-- =============================================
-- She Can Foundation - Database Schema
-- =============================================
-- Run this in your Neon SQL editor to create the table.
-- (The server.js also runs this automatically on startup.)

-- Drop table if you need a clean slate (be careful in production!)
-- DROP TABLE IF EXISTS submissions;

-- Create the submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id          SERIAL PRIMARY KEY,           -- Auto-incrementing unique ID
  full_name   VARCHAR(100) NOT NULL,        -- Contact's full name
  email       VARCHAR(150) NOT NULL,        -- Email address
  phone       VARCHAR(20),                  -- Phone number (optional)
  city        VARCHAR(80),                  -- City they're from (optional)
  interest    VARCHAR(100),                 -- Area of interest (dropdown value)
  message     TEXT,                         -- Free-form message (optional)
  volunteer   BOOLEAN DEFAULT FALSE,        -- Did they check the volunteer box?
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Submission timestamp
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

-- Index for faster date-range queries
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- ── Sample Data (for testing) ────────────────
-- INSERT INTO submissions (full_name, email, phone, city, interest, message, volunteer)
-- VALUES
--   ('Priya Sharma',  'priya@example.com',  '9876543210', 'Mumbai',    'Education',   'I want to teach underprivileged girls.', TRUE),
--   ('Ananya Singh',  'ananya@example.com', '8765432109', 'Delhi',     'Healthcare',  'Happy to help at health camps.',         TRUE),
--   ('Meera Patel',   'meera@example.com',  NULL,         'Pune',      'Skills',      'I am a trained stitching teacher.',      FALSE);

-- ── Useful Queries ───────────────────────────
-- View all submissions:
--   SELECT * FROM submissions ORDER BY created_at DESC;

-- Count volunteers:
--   SELECT COUNT(*) FROM submissions WHERE volunteer = TRUE;

-- Search by interest:
--   SELECT * FROM submissions WHERE interest = 'Education';
