import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./supabase";

// CORS is set per-response here (vercel.json deliberately sets no CORS headers —
// two sources would emit a duplicate Access-Control-Allow-Origin and browsers
// reject that). CLIENT_URL may hold a comma-separated list, which is how you add
// a preview deployment origin without a code change.
const PUBLIC_ORIGINS = [
  ...(process.env.CLIENT_URL?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
  "https://communest.vercel.app",
  "http://localhost:8443",
];

export function setCorsHeaders(res: VercelResponse, req: VercelRequest) {
  const origin =
    typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowedOrigin = PUBLIC_ORIGINS.includes(origin)
    ? origin
    : PUBLIC_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function sendJson(
  res: VercelResponse,
  req: VercelRequest,
  body: unknown,
  status = 200,
) {
  setCorsHeaders(res, req);
  res.status(status).json(body);
}

export function sendOptions(res: VercelResponse, req: VercelRequest) {
  setCorsHeaders(res, req);
  res.status(204).end();
}

export function parseJson(req: VercelRequest) {
  return req.body ?? {};
}

export async function requireAuth(req: VercelRequest) {
  const authHeader = req.headers.authorization ?? req.headers.Authorization;
  const token =
    typeof authHeader === "string" ? authHeader.replace("Bearer ", "") : "";
  if (!token) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role, estate_id")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) throw new Error("Unauthorized");

  return {
    userId: data.user.id,
    role: profile.role as string,
    estateId: profile.estate_id as string | null,
  };
}
