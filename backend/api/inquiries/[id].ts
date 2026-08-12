import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const INQUIRY_FIELDS =
  "id,estate_id,house_id,user_id,user_name,user_email,user_phone,message,reply,status,created_at,replied_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const inquiryId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id;
  if (!inquiryId) {
    return sendJson(res, req, { error: "Inquiry ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .select(INQUIRY_FIELDS)
      .eq("id", inquiryId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { inquiry: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      const body = parseJson(req);
      const patch: Record<string, unknown> = {};
      if (body.reply !== undefined) patch.reply = body.reply;
      if (body.status !== undefined) patch.status = body.status;

      if (Object.keys(patch).length === 0) {
        return sendJson(
          res,
          req,
          { error: "No valid update fields provided" },
          400,
        );
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("inquiries")
        .select("estate_id,user_id")
        .eq("id", inquiryId)
        .single();
      if (existingError || !existing)
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Inquiry not found" },
          404,
        );

      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }
      if (role === "tenant" && existing.user_id !== userId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      if (patch.reply) patch.replied_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from("inquiries")
        .update(patch)
        .eq("id", inquiryId)
        .select(INQUIRY_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { inquiry: data }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
