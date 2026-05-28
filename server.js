// =============================================
// She Can Foundation - Express Backend Server
// =============================================
// Beginner tip: This is the main server file.
// It handles all API requests and connects to the database.

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

// ── App Setup ────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Database Connection (Neon PostgreSQL) ────
// Pool manages multiple DB connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon's SSL
  },
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.log("💡 Make sure DATABASE_URL is set in your .env file");
  } else {
    console.log("✅ Connected to Neon PostgreSQL!");
    release();
    // Auto-create the table if it doesn't exist
    initializeDatabase();
  }
});

// ── Create Table if Not Exists ───────────────
async function initializeDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS submissions (
      id          SERIAL PRIMARY KEY,
      full_name   VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL,
      phone       VARCHAR(20),
      city        VARCHAR(80),
      interest    VARCHAR(100),
      message     TEXT,
      volunteer   BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  try {
    await pool.query(createTableSQL);
    console.log("✅ Database table ready (submissions)");
  } catch (err) {
    console.error("❌ Table creation failed:", err.message);
  }
}

// ── Middleware ───────────────────────────────
// CORS: Allow frontend to talk to backend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      /\.vercel\.app$/, // Allow any Vercel deployment
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, "public")));

// ── Input Validation Helper ──────────────────
// Beginner tip: Always validate data before saving to DB!
function validateSubmission(data) {
  const errors = [];

  // Full name: required, 2–100 chars
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters.");
  }
  if (data.full_name && data.full_name.trim().length > 100) {
    errors.push("Full name must be under 100 characters.");
  }

  // Email: required, must look like an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.push("A valid email address is required.");
  }

  // Phone: optional, but if provided must be 7–15 digits
  if (data.phone) {
    const phoneClean = data.phone.replace(/[\s\-\+\(\)]/g, "");
    if (!/^\d{7,15}$/.test(phoneClean)) {
      errors.push("Phone number must be 7–15 digits.");
    }
  }

  // Message: optional, but max 1000 chars
  if (data.message && data.message.length > 1000) {
    errors.push("Message must be under 1000 characters.");
  }

  return errors;
}

// ── API Routes ───────────────────────────────

// POST /api/contact  →  Save a new form submission
app.post("/api/contact", async (req, res) => {
  try {
    const { full_name, email, phone, city, interest, message, volunteer } =
      req.body;

    // Validate inputs
    const errors = validateSubmission(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Insert into database
    const insertSQL = `
      INSERT INTO submissions (full_name, email, phone, city, interest, message, volunteer)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at;
    `;
    const values = [
      full_name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      city ? city.trim() : null,
      interest || null,
      message ? message.trim() : null,
      volunteer === true || volunteer === "true", // Ensure boolean
    ];

    const result = await pool.query(insertSQL, values);
    const newRecord = result.rows[0];

    console.log(`📬 New submission #${newRecord.id} from ${email}`);

    return res.status(201).json({
      success: true,
      message: "Thank you! We'll be in touch soon. 💜",
      id: newRecord.id,
      submitted_at: newRecord.created_at,
    });
  } catch (err) {
    console.error("❌ /api/contact error:", err.message);
    return res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`,
    });
  }
});

// GET /api/admin/submissions  →  Fetch all submissions (admin only)
app.get("/api/admin/submissions", async (req, res) => {
  try {
    // Simple secret-key auth (header: x-admin-secret)
    const adminSecret = req.headers["x-admin-secret"];
    if (
      process.env.ADMIN_SECRET &&
      adminSecret !== process.env.ADMIN_SECRET
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid admin secret.",
      });
    }

    // Optional search filter
    const search = req.query.search ? `%${req.query.search}%` : null;

    let querySQL, queryValues;
    if (search) {
      querySQL = `
        SELECT * FROM submissions
        WHERE full_name ILIKE $1 OR email ILIKE $1 OR city ILIKE $1 OR interest ILIKE $1
        ORDER BY created_at DESC;
      `;
      queryValues = [search];
    } else {
      querySQL = `SELECT * FROM submissions ORDER BY created_at DESC;`;
      queryValues = [];
    }

    const result = await pool.query(querySQL, queryValues);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      submissions: result.rows,
    });
  } catch (err) {
    console.error("❌ /api/admin/submissions error:", err.message);
    return res.status(500).json({
      success: false,
      message: `Server error fetching submissions: ${err.message}`,
    });
  }
});

// GET /api/health  →  Health check (useful for Render/Railway)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Catch-all: Serve index.html for any unknown route ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   She Can Foundation Server Running   ║
  ║   http://localhost:${PORT}               ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app; // Exported for testing
