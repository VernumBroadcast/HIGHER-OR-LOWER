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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialize database table
async function initDatabase() {
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
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes

// Get current configuration
app.get('/api/config', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save configuration
app.post('/api/config', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to save configuration' });
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
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
