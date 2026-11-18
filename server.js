require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const RTDB_URL = process.env.RTDB_URL || process.env.FIREBASE_DATABASE_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to format RTDB request URL
function getRtdbUrl(path = '') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  if (!cleanPath) {
    return `${RTDB_URL}/.json`;
  }
  return `${RTDB_URL}/${cleanPath}.json`;
}

// Serve static UI / HTML dashboard
app.get('/', async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).send('<h1>Error</h1><p>RTDB_URL is not defined in .env</p>');
    }

    const response = await fetch(`${RTDB_URL}/.json`);
    const data = await response.json();

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BizFlow Dashboard - Firebase RTDB</title>
        <style>
          :root {
            --primary: #4f46e5;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text: #1e293b;
            --border: #e2e8f0;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 2rem;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          h1 {
            font-size: 1.875rem;
            color: var(--primary);
            margin: 0;
          }
          .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 1.5rem;
          }
          pre {
            background: #0f172a;
            color: #38bdf8;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.875rem;
          }
          .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover {
            opacity: 0.9;
          }
          .meta {
            font-size: 0.85rem;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div>
              <h1>BizFlow Dashboard</h1>
              <p class="meta">Firebase RTDB: ${RTDB_URL}</p>
            </div>
            <button class="btn" onclick="location.reload()">Refresh Data</button>
          </header>

          <div class="card">
            <h2>Live RTDB Data</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Failed to fetch from RTDB:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h2 style="color: red;">Gagal mengambil data dari Firebase RTDB</h2>
        <pre>${err.message}</pre>
      </body>
      </html>
    `);
  }
});

// Existing JSON API endpoint
app.get('/api/data', async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ error: 'RTDB_URL is not defined in .env' });
    }
    const response = await fetch(`${RTDB_URL}/.json`);
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// REST API ENDPOINTS FOR FIREBASE RTDB
// ==========================================

// 1. GET: Ambil data (Root atau berdasarkan path)
app.get(['/api/rtdb', '/api/rtdb/:path(*)'], async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ success: false, error: 'RTDB_URL is not defined in .env' });
    }
    const url = getRtdbUrl(req.params.path);
    const response = await fetch(url);
    const data = await response.json();
    res.json({ success: true, path: req.params.path || '/', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST: Tambah data baru dengan auto-ID (Push)
app.post(['/api/rtdb', '/api/rtdb/:path(*)'], async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ success: false, error: 'RTDB_URL is not defined in .env' });
    }
    const url = getRtdbUrl(req.params.path);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ success: true, message: 'Data pushed successfully', result: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. PUT: Timpa/Set data pada path tertentu
app.put(['/api/rtdb', '/api/rtdb/:path(*)'], async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ success: false, error: 'RTDB_URL is not defined in .env' });
    }
    const url = getRtdbUrl(req.params.path);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ success: true, message: 'Data set successfully', result: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. PATCH: Update sebagian data pada path tertentu
app.patch(['/api/rtdb', '/api/rtdb/:path(*)'], async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ success: false, error: 'RTDB_URL is not defined in .env' });
    }
    const url = getRtdbUrl(req.params.path);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ success: true, message: 'Data updated successfully', result: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE: Hapus data pada path tertentu
app.delete(['/api/rtdb', '/api/rtdb/:path(*)'], async (req, res) => {
  try {
    if (!RTDB_URL) {
      return res.status(500).json({ success: false, error: 'RTDB_URL is not defined in .env' });
    }
    const url = getRtdbUrl(req.params.path);
    const response = await fetch(url, {
      method: 'DELETE'
    });
    const data = await response.json();
    res.json({ success: true, message: 'Data deleted successfully', result: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
