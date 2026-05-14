import { VercelRequest, VercelResponse } from '@vercel/node';
import Database from 'better-sqlite3';
import path from 'path';

// Note: On Vercel, the filesystem is ephemeral and usually read-only.
// We use /tmp to at least allow the process to run without crashing,
// but data will NOT persist between function calls or deployments.
const dbPath = path.join('/tmp', 'creatives.db');
let db: any;

try {
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS blueprints (
      id TEXT PRIMARY KEY,
      name TEXT,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (e) {
  console.error("DB Init failed", e);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    if (req.method === 'GET') {
      const history = db.prepare("SELECT * FROM blueprints ORDER BY createdAt DESC").all();
      return res.json(history.map((h: any) => ({ ...h, data: JSON.parse(h.data) })));
    }

    if (req.method === 'POST') {
      const { id, name, data } = req.body;
      const stmt = db.prepare("INSERT OR REPLACE INTO blueprints (id, name, data) VALUES (?, ?, ?)");
      stmt.run(id, name, JSON.stringify(data));
      return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      db.prepare("DELETE FROM blueprints WHERE id = ?").run(id);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
