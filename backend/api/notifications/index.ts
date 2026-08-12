import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const NOTIFICATION_FIELDS =
  "id,estate_id,title,description,event_date,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    try {
      const { role, estateId } = await requireAuth(req);
      let query = supabaseAdmin
        .from("notifications")
        .select(NOTIFICATION_FIELDS);
      const { estateId: estateQuery } = req.query as Record<
        string,
        string | string[]
      >;
      if (estateQuery) {
        query = query.eq(
          "estate_id",
          Array.isArray(estateQuery) ? estateQuery[0] : estateQuery,
        );
      }
      if (role === "estate_admin" || role === "tenant") {
        query = query.eq("estate_id", estateId);
      }
      const { data, error } = await query;
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { notifications: data ?? [] }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "POST") {
    try {
      const { role, estateId } = await requireAuth(req);
      if (role !== "estate_admin" && role !== "communest_admin") {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const body = parseJson(req);
      const required = ["estateId", "title", "description", "eventDate"];
      for (const field of required) {
        if (!body[field]) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }

      if (role === "estate_admin" && body.estateId !== estateId) {
        return sendJson(
          res,
          req,
          { error: "Cannot create notifications outside your estate" },
          403,
        );
      }

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert([
          {
            estate_id: body.estateId,
            title: body.title,
            description: body.description,
            event_date: body.eventDate,
          },
        ])
        .select(NOTIFICATION_FIELDS)
        .single();

      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { notification: data }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
