import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions } from "../../lib/auth";

const PAYMENT_OPTION_FIELDS = "id,estate_id,method,details,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const optionId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!optionId) {
    return sendJson(res, req, { error: "Payment option ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("payment_options")
      .select(PAYMENT_OPTION_FIELDS)
      .eq("id", optionId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { paymentOption: data }, 200);
  }

  if (req.method === "DELETE") {
    try {
      const { role, estateId } = await requireAuth(req);
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("payment_options")
        .select("estate_id")
        .eq("id", optionId)
        .single();

      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Payment option not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const { error } = await supabaseAdmin
        .from("payment_options")
        .delete()
        .eq("id", optionId);
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, null, 204);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
