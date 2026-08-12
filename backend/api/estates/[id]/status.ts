import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../../lib/supabase";
import {
  sendJson,
  sendOptions,
  parseJson,
  requireAuth,
} from "../../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method !== "PATCH") {
    return sendJson(res, req, { error: "Method Not Allowed" }, 405);
  }

  try {
    const { role } = await requireAuth(req);
    if (role !== "communest_admin") {
      return sendJson(res, req, { error: "Forbidden" }, 403);
    }

    const body = parseJson(req);
    const status = body.status;
    if (!["approved", "denied", "pending"].includes(status)) {
      return sendJson(res, req, { error: "Invalid status" }, 400);
    }

    const estateId = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    if (!estateId) {
      return sendJson(res, req, { error: "Estate ID is required" }, 400);
    }

    const { data: estate, error: estateError } = await supabaseAdmin
      .from("estates")
      .select("admin_id")
      .eq("id", estateId)
      .single();
    if (estateError || !estate) {
      return sendJson(
        res,
        req,
        { error: estateError?.message ?? "Estate not found" },
        404,
      );
    }

    const { error: statusError } = await supabaseAdmin
      .from("estates")
      .update({ status })
      .eq("id", estateId);
    if (statusError) {
      return sendJson(res, req, { error: statusError.message }, 500);
    }

    if (status === "approved") {
      const { error: userError } = await supabaseAdmin
        .from("users")
        .update({ role: "estate_admin", estate_id: estateId })
        .eq("id", estate.admin_id);
      if (userError) {
        return sendJson(res, req, { error: userError.message }, 500);
      }

      await supabaseAdmin.auth.admin.updateUserById(estate.admin_id, {
        user_metadata: { role: "estate_admin", estate_id: estateId },
      });
    }

    return sendJson(res, req, { success: true }, 200);
  } catch {
    return sendJson(res, req, { error: "Unauthorized" }, 401);
  }
}
