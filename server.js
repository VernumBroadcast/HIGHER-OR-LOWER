const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database connection
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
  });
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
} else {
  console.warn('DATABASE_URL not set. Configuration will not persist across devices.');
}

// Initialize database table
async function initDatabase() {
  if (!pool) {
    console.warn('No database connection. Using in-memory storage (not persistent).');
    return;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configurations (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        choices JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Configuration will not persist. Please check DATABASE_URL.');
  }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: pool ? 'connected' : 'not connected' });
});

// Get current configuration
app.get('/api/config', async (req, res) => {
  if (!pool) {
    return res.json({ question: null, choices: [], error: 'Database not configured' });
  }
  
  try {
    const result = await pool.query(
      'SELECT question, choices FROM configurations ORDER BY updated_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json({ question: null, choices: [] });
    }
    
    res.json({
      question: result.rows[0].question,
      choices: result.rows[0].choices
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    // If database error, return empty config instead of error
    res.json({ question: null, choices: [], error: error.message });
  }
});

// Save configuration
app.post('/api/config', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured. Please add a PostgreSQL database in Railway.' });
  }
  
  try {
    const { question, choices } = req.body;
    
    if (!question || !choices || !Array.isArray(choices)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Delete old configuration and insert new one
    await pool.query('DELETE FROM configurations');
    
    const result = await pool.query(
      'INSERT INTO configurations (question, choices) VALUES ($1, $2) RETURNING id',
      [question, JSON.stringify(choices)]
    );
    
    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Configuration saved successfully' 
    });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration: ' + error.message });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/game.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  WARNING: DATABASE_URL not set. Add a PostgreSQL database in Railway to enable cross-device sync.');
  }
  initDatabase();
});
