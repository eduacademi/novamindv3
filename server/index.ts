import path from "path";
import express from "express";
import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  app.get("/landing", (_req, res) => res.sendFile(path.join(process.cwd(), "public", "landing.html")));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1y", index: false, setHeaders: (res, filePath) => {
      if (!filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader("Cache-Control", "no-cache");
    } }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 NovaMind Server running on http://localhost:${PORT}`);
  });
}

startServer();
