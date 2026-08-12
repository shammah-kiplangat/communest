import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { sendJson, sendOptions, parseJson, requireAuth } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const { role } = await requireAuth(req);
        if (role === "communest_admin") {
          const { data, error } = await supabaseAdmin
            .from("estates")
            .select("*");
          if (error) return sendJson(res, req, { error: error.message }, 500);
          return sendJson(res, req, { estates: data }, 200);
        }
      } catch {
        // public fallback
      }
    }

    const { data, error } = await supabaseAdmin
      .from("estates")
      .select("*")
      .eq("status", "approved");
    if (error) return sendJson(res, req, { error: error.message }, 500);
    return sendJson(res, req, { estates: data }, 200);
  }

  if (req.method === "POST") {
    try {
      const { userId, role } = await requireAuth(req);
      if (role !== "regular_user" && role !== "estate_admin") {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const body = parseJson(req);
      const required = [
        "name",
        "location",
        "county",
        "units",
        "total_area",
        "management_name",
        "management_email",
        "management_phone",
        "title_deed_number",
      ];
      for (const field of required) {
        if (!body[field]) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }

      const { data, error } = await supabaseAdmin
        .from("estates")
        .insert([{ ...body, status: "pending", admin_id: userId }]);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { estate: data?.[0] ?? null }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
