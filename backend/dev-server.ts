/**
 * Local development server.
 *
 * Serves the `api/**` Vercel functions over plain Node HTTP so the backend can
 * run without the Vercel CLI (no login, no project link, works offline).
 * File routing mirrors Vercel's: `api/estates/index.ts` -> `/api/estates`,
 * `api/estates/[id].ts` -> `/api/estates/:id`, static segments beating dynamic.
 *
 * For prod-parity checks (vercel.json headers, edge config) use `pnpm dev:vercel`.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = import.meta.dirname;
const API_DIR = path.join(ROOT, "api");
const PORT = parseInt(process.env.PORT || "3000", 10);

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

type Route = { segments: string[]; file: string };
type Match = { route: Route; params: Record<string, string> };
type Handler = (req: IncomingMessage, res: ServerResponse) => unknown;

/**
 * `loadEnvFile` never overwrites a variable that is already set, so the FIRST
 * file to define a key wins. `.env.local` is read first to give it precedence
 * over `.env`, matching the Vite/Next convention.
 */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (existsSync(full)) {
      process.loadEnvFile(full);
      console.log(`  env  loaded ${file}`);
    }
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `\n  ⚠  missing env: ${missing.join(", ")}` +
        `\n     Copy backend/.env.example to backend/.env and fill it in,` +
        `\n     otherwise every Supabase-backed route will fail.\n`,
    );
  }
}

async function collectRoutes(dir: string, base: string[] = []): Promise<Route[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes: Route[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...(await collectRoutes(full, [...base, entry.name])));
      continue;
    }
    if (!entry.name.endsWith(".ts") || entry.name.endsWith(".d.ts")) continue;

    const name = entry.name.slice(0, -3);
    routes.push({ segments: name === "index" ? base : [...base, name], file: full });
  }

  return routes;
}

const isDynamic = (segment: string) => segment.startsWith("[") && segment.endsWith("]");

/** Highest number of literal segment matches wins, so `/estates/mine` beats `/estates/[id]`. */
function matchRoute(routes: Route[], urlSegments: string[]): Match | null {
  let best: Match | null = null;
  let bestScore = -1;

  for (const route of routes) {
    if (route.segments.length !== urlSegments.length) continue;

    const params: Record<string, string> = {};
    let score = 0;
    let matched = true;

    for (let i = 0; i < route.segments.length; i++) {
      const segment = route.segments[i];
      if (isDynamic(segment)) {
        params[segment.slice(1, -1)] = decodeURIComponent(urlSegments[i]);
      } else if (segment === urlSegments[i]) {
        score++;
      } else {
        matched = false;
        break;
      }
    }

    if (matched && score > bestScore) {
      best = { route, params };
      bestScore = score;
    }
  }

  return best;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

/** Adds the Express-flavoured helpers `@vercel/node` handlers expect on `res`. */
function decorateResponse(res: ServerResponse) {
  const shim = res as ServerResponse & {
    status: (code: number) => typeof shim;
    json: (body: unknown) => typeof shim;
    send: (body: unknown) => typeof shim;
    redirect: (statusOrUrl: number | string, maybeUrl?: string) => typeof shim;
  };

  shim.status = (code) => {
    shim.statusCode = code;
    return shim;
  };

  shim.json = (body) => {
    if (!shim.getHeader("Content-Type")) {
      shim.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    shim.end(JSON.stringify(body));
    return shim;
  };

  shim.send = (body) => {
    if (body === null || body === undefined) {
      shim.end();
    } else if (typeof body === "string" || Buffer.isBuffer(body)) {
      shim.end(body);
    } else {
      shim.json(body);
    }
    return shim;
  };

  shim.redirect = (statusOrUrl, maybeUrl) => {
    const status = typeof statusOrUrl === "number" ? statusOrUrl : 302;
    const url = typeof statusOrUrl === "number" ? maybeUrl! : statusOrUrl;
    shim.statusCode = status;
    shim.setHeader("Location", url);
    shim.end();
    return shim;
  };

  return shim;
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header
      .split(";")
      .map((pair) => pair.trim().split("="))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...rest]) => [key, decodeURIComponent(rest.join("="))]),
  );
}

async function main() {
  loadEnv();

  const routes = await collectRoutes(API_DIR);
  console.log(`  api  ${routes.length} routes from backend/api`);

  const server = createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    const shim = decorateResponse(res);

    const finish = () =>
      console.log(
        `  ${req.method?.padEnd(6)} ${url.pathname} -> ${res.statusCode} (${Date.now() - started}ms)`,
      );
    res.on("finish", finish);

    if (url.pathname === "/health") {
      return shim.status(200).json({ ok: true });
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] !== "api") {
      return shim.status(404).json({ error: `No route for ${url.pathname}` });
    }

    const match = matchRoute(routes, segments.slice(1));
    if (!match) {
      return shim.status(404).json({ error: `No route for ${url.pathname}` });
    }

    // Vercel merges dynamic params and query string into `req.query`.
    const query: Record<string, string | string[]> = { ...match.params };
    for (const [key, value] of url.searchParams.entries()) {
      const existing = query[key];
      query[key] = existing === undefined
        ? value
        : Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
    }

    const raw = await readBody(req);
    let body: unknown = undefined;
    if (raw) {
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        try {
          body = JSON.parse(raw);
        } catch {
          return shim.status(400).json({ error: "Invalid JSON body" });
        }
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        body = Object.fromEntries(new URLSearchParams(raw));
      } else {
        body = raw;
      }
    }

    Object.assign(req, { query, body, cookies: parseCookies(req.headers.cookie) });

    try {
      const mod = await import(pathToFileURL(match.route.file).href);
      const handler = (mod.default ?? mod.handler) as Handler | undefined;
      if (typeof handler !== "function") {
        return shim.status(500).json({
          error: `${path.relative(ROOT, match.route.file)} has no default export`,
        });
      }
      await handler(req, res);
    } catch (error) {
      console.error(`  ✖  ${url.pathname}`, error);
      if (!res.headersSent) {
        shim.status(500).json({
          error: error instanceof Error ? error.message : "Internal Server Error",
        });
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`\n  ➜  backend ready on http://localhost:${PORT}/api\n`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
