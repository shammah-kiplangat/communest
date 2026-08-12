import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const INQUIRY_FIELDS =
  "id,estate_id,house_id,user_id,user_name,user_email,user_phone,message,reply,status,created_at,replied_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      let query = supabaseAdmin.from("inquiries").select(INQUIRY_FIELDS);
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
      return sendJson(res, req, { inquiries: data ?? [] }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "POST") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      const body = parseJson(req);
      const requiredFields = ["estateId", "houseId", "message"];
      for (const field of requiredFields) {
        if (!body[field])
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
      }
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("full_name,email,phone")
        .eq("id", userId)
        .single();
      if (error || !data)
        return sendJson(
          res,
          req,
          { error: "Unable to load user profile" },
          500,
        );

      const { data: inquiry, error: insertError } = await supabaseAdmin
        .from("inquiries")
        .insert([
          {
            estate_id: body.estateId,
            house_id: body.houseId,
            user_id: userId,
            user_name: data.full_name,
            user_email: data.email,
            user_phone: data.phone,
            message: body.message,
            status: "pending",
          },
        ])
        .select(INQUIRY_FIELDS)
        .single();

      if (insertError)
        return sendJson(res, req, { error: insertError.message }, 500);
      return sendJson(res, req, { inquiry }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
