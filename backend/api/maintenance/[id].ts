import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const MAINTENANCE_FIELDS =
  "id,estate_id,house_id,title,description,status,priority,reported_by,assigned_to,created_at,resolved_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const maintenanceId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id;
  if (!maintenanceId) {
    return sendJson(
      res,
      req,
      { error: "Maintenance item ID is required" },
      400,
    );
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("maintenance_items")
      .select(MAINTENANCE_FIELDS)
      .eq("id", maintenanceId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { maintenance: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      const { role, estateId } = await requireAuth(req);
      const body = parseJson(req);
      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) patch.title = body.title;
      if (body.description !== undefined) patch.description = body.description;
      if (body.status !== undefined) patch.status = body.status;
      if (body.priority !== undefined) patch.priority = body.priority;
      if (body.assignedTo !== undefined) patch.assigned_to = body.assignedTo;
      if (body.resolvedAt !== undefined) patch.resolved_at = body.resolvedAt;

      if (Object.keys(patch).length === 0) {
        return sendJson(
          res,
          req,
          { error: "No valid update fields provided" },
          400,
        );
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("maintenance_items")
        .select("estate_id")
        .eq("id", maintenanceId)
        .single();
      if (existingError || !existing)
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Maintenance item not found" },
          404,
        );
      if (role === "estate_admin" && existing.estate_id !== estateId)
        return sendJson(res, req, { error: "Forbidden" }, 403);

      const { data, error } = await supabaseAdmin
        .from("maintenance_items")
        .update(patch)
        .eq("id", maintenanceId)
        .select(MAINTENANCE_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { maintenance: data }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "DELETE") {
    try {
      const { role, estateId } = await requireAuth(req);
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("maintenance_items")
        .select("estate_id")
        .eq("id", maintenanceId)
        .single();
      if (existingError || !existing)
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Maintenance item not found" },
          404,
        );
      if (role === "estate_admin" && existing.estate_id !== estateId)
        return sendJson(res, req, { error: "Forbidden" }, 403);

      const { error } = await supabaseAdmin
        .from("maintenance_items")
        .delete()
        .eq("id", maintenanceId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, null, 204);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
