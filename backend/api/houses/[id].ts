import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const HOUSE_FIELDS =
  "id,estate_id,house_number,total_area,rooms,photos,amenities,rent,manager_phone,status,occupied_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const houseId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!houseId) {
    return sendJson(res, req, { error: "House ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("houses")
      .select(HOUSE_FIELDS)
      .eq("id", houseId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { house: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      const { role, estateId } = await requireAuth(req);
      const body = parseJson(req);
      const allowedFields: Record<string, string> = {
        houseNumber: "house_number",
        totalArea: "total_area",
        rooms: "rooms",
        photos: "photos",
        amenities: "amenities",
        rent: "rent",
        managerPhone: "manager_phone",
        status: "status",
        occupiedAt: "occupied_at",
        estateId: "estate_id",
        houseNumber: "house_number",
      };
      const patch: Record<string, unknown> = {};
      for (const key of Object.keys(allowedFields)) {
        if (body[key] !== undefined) patch[allowedFields[key]] = body[key];
      }

      if (Object.keys(patch).length === 0) {
        return sendJson(
          res,
          req,
          { error: "No valid update fields provided" },
          400,
        );
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("houses")
        .select("estate_id")
        .eq("id", houseId)
        .single();
      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "House not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      if (patch.status === "occupied" && !patch.occupied_at) {
        patch.occupied_at = new Date().toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from("houses")
        .update(patch)
        .eq("id", houseId)
        .select(HOUSE_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { house: data }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "DELETE") {
    try {
      const { role, estateId } = await requireAuth(req);
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("houses")
        .select("estate_id")
        .eq("id", houseId)
        .single();
      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "House not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }
      const { error } = await supabaseAdmin
        .from("houses")
        .delete()
        .eq("id", houseId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, null, 204);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
