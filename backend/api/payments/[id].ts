import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const PAYMENT_FIELDS =
  "id,estate_id,house_id,tenant_id,amount,type,status,due_date,paid_at,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const paymentId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id;
  if (!paymentId) {
    return sendJson(res, req, { error: "Payment ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select(PAYMENT_FIELDS)
      .eq("id", paymentId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { payment: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      const body = parseJson(req);
      const patch: Record<string, unknown> = {};
      if (body.status !== undefined) patch.status = body.status;
      if (body.paidAt !== undefined) patch.paid_at = body.paidAt;
      if (body.amount !== undefined) patch.amount = body.amount;
      if (body.dueDate !== undefined) patch.due_date = body.dueDate;

      if (Object.keys(patch).length === 0) {
        return sendJson(
          res,
          req,
          { error: "No valid update fields provided" },
          400,
        );
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("payments")
        .select("estate_id,tenant_id")
        .eq("id", paymentId)
        .single();
      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Payment not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }
      if (role === "tenant" && existing.tenant_id !== userId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const { data, error } = await supabaseAdmin
        .from("payments")
        .update(patch)
        .eq("id", paymentId)
        .select(PAYMENT_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { payment: data }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
