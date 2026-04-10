import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";
import { SCHEMA_SQL } from "./lib/dbSchema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("⚠️ DATABASE_URL not found. Automatic table creation skipped.");
    console.warn("Please add DATABASE_URL to your environment variables to enable auto-migration.");
    return;
  }

  try {
    console.log("🔄 Initializing database schema...");
    const sql = postgres(databaseUrl, { ssl: 'require' });
    
    // Execute the schema SQL
    await sql.unsafe(SCHEMA_SQL);
    
    console.log("✅ Database schema is up to date.");
    await sql.end();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

async function startServer() {
  // Initialize DB before starting the server
  await initDatabase();

  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === "production" || process.env.PROD === "true";

  app.use(express.json({ limit: '10mb' }));

  // Vite middleware for development
  if (!isProduction) {
    console.log("Starting in DEVELOPMENT mode...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    if (!isProduction) {
      console.log(`Development server running on http://localhost:${PORT}`);
    } else {
      console.log(`Production server running on port ${PORT}`);
    }
  });
}

startServer();
