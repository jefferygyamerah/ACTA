#!/usr/bin/env node
/* ACTA presentation website — dedicated loopback-only static server.
 * Serves only the directory containing this file (website/).
 * Rejects path traversal, dotfiles, unknown extensions and non-GET/HEAD methods.
 * Does not touch the ACTA app (4318), the evidence server (4320), data or models.
 */
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 4321;
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "Method not allowed\n");
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      return send(res, 400, "Bad request\n");
    }
    const normalized = path.normalize(pathname).replace(/^([/\\])+/, "");
    const filePath = path.join(ROOT, normalized);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      return send(res, 403, "Forbidden\n");
    }
    const parts = normalized.split(/[/\\]/).filter(Boolean);
    if (parts.some((p) => p.startsWith("."))) {
      return send(res, 403, "Forbidden\n");
    }
    let target = filePath;
    let stat = await fs.stat(target).catch(() => null);
    if (stat && stat.isDirectory()) {
      target = path.join(target, "index.html");
      stat = await fs.stat(target).catch(() => null);
    }
    if (!stat || !stat.isFile()) {
      return send(res, 404, "Not found\n");
    }
    const type = MIME[path.extname(target).toLowerCase()];
    if (!type) {
      return send(res, 415, "Unsupported media type\n");
    }
    const body = await fs.readFile(target);
    res.writeHead(200, {
      "content-type": type,
      "content-length": body.length,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (err) {
    send(res, 500, "Internal error\n");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ACTA website server: http://${HOST}:${PORT}/ serving ${ROOT} (pid ${process.pid})`);
});
