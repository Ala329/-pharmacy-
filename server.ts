import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check for simulation scripts
  app.get("/api/health", (req, res) => {
    res.json({ status: "system_online", timestamp: new Date().toISOString() });
  });

  // Proxy for AI/Simulation data if needed
  app.post("/api/simulate/event", (req, res) => {
    console.log("Log received from simulation engine:", req.body);
    res.json({ success: true, received: req.body });
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
    console.log(`PharmaTrust Server Running: http://localhost:${PORT}`);
  });
}

startServer();
