import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions } from "../../lib/auth";

const NOTIFICATION_FIELDS =
  "id,estate_id,title,description,event_date,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const notificationId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id;
  if (!notificationId) {
    return sendJson(res, req, { error: "Notification ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select(NOTIFICATION_FIELDS)
      .eq("id", notificationId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { notification: data }, 200);
  }

  if (req.method === "DELETE") {
    try {
      const { role, estateId } = await requireAuth(req);
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("notifications")
        .select("estate_id")
        .eq("id", notificationId)
        .single();

      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Notification not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const { error } = await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, null, 204);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
