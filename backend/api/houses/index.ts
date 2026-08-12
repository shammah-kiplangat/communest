import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const HOUSE_FIELDS =
  "id,estate_id,house_number,total_area,rooms,photos,amenities,rent,manager_phone,status,occupied_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    let query = supabaseAdmin.from("houses").select(HOUSE_FIELDS);

    try {
      const { role, estateId } = await requireAuth(req);
      if (role === "estate_admin" || role === "tenant") {
        query = query.eq("estate_id", estateId);
      }
    } catch {
      // Public read allowed for houses
    }

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

    const { data, error } = await query;
    if (error) return sendJson(res, req, { error: error.message }, 500);
    return sendJson(res, req, { houses: data ?? [] }, 200);
  }

  if (req.method === "POST") {
    try {
      const { role, estateId } = await requireAuth(req);
      if (role !== "estate_admin" && role !== "communest_admin") {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const body = parseJson(req);
      const requiredFields = [
        "estateId",
        "houseNumber",
        "totalArea",
        "rooms",
        "photos",
        "amenities",
        "rent",
        "managerPhone",
      ];
      for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }

      if (role === "estate_admin" && body.estateId !== estateId) {
        return sendJson(
          res,
          req,
          { error: "Cannot create houses outside your estate" },
          403,
        );
      }

      const { data, error } = await supabaseAdmin
        .from("houses")
        .insert([
          {
            estate_id: body.estateId,
            house_number: body.houseNumber,
            total_area: body.totalArea,
            rooms: body.rooms,
            photos: body.photos,
            amenities: body.amenities,
            rent: body.rent,
            manager_phone: body.managerPhone,
            status: body.status || "vacant",
          },
        ])
        .select(HOUSE_FIELDS)
        .single();

      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { house: data }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
