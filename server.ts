import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

const db = new Database("creatives.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    name TEXT,
    data TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM blueprints ORDER BY createdAt DESC").all();
    res.json(history.map((h: any) => ({ ...h, data: JSON.parse(h.data) })));
  });

  app.post("/api/history", (req, res) => {
    const { id, name, data } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO blueprints (id, name, data) VALUES (?, ?, ?)");
    stmt.run(id, name, JSON.stringify(data));
    res.json({ success: true });
  });

  app.delete("/api/history/:id", (req, res) => {
    db.prepare("DELETE FROM blueprints WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
