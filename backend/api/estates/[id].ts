import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { sendJson, sendOptions, parseJson, requireAuth } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const estateId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!estateId) {
    return sendJson(res, req, { error: "Estate ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("estates")
      .select("*")
      .eq("id", estateId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { estate: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      await requireAuth(req);
      const body = parseJson(req);
      const { data, error } = await supabaseAdmin
        .from("estates")
        .update(body)
        .eq("id", estateId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { estate: data?.[0] ?? null }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "DELETE") {
    try {
      await requireAuth(req);
      const { error } = await supabaseAdmin
        .from("estates")
        .delete()
        .eq("id", estateId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, null, 204);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
