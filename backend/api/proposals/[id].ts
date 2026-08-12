import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const PROPOSAL_FIELDS =
  "id,estate_id,house_id,applicant_id,applicant_name,applicant_email,applicant_phone,message,status,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  const proposalId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id;
  if (!proposalId) {
    return sendJson(res, req, { error: "Proposal ID is required" }, 400);
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("rental_proposals")
      .select(PROPOSAL_FIELDS)
      .eq("id", proposalId)
      .single();
    if (error) return sendJson(res, req, { error: error.message }, 404);
    return sendJson(res, req, { proposal: data }, 200);
  }

  if (req.method === "PATCH") {
    try {
      const { role, estateId } = await requireAuth(req);
      const body = parseJson(req);
      const patch: Record<string, unknown> = {};
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
        .from("rental_proposals")
        .select("estate_id")
        .eq("id", proposalId)
        .single();
      if (existingError || !existing) {
        return sendJson(
          res,
          req,
          { error: existingError?.message || "Proposal not found" },
          404,
        );
      }
      if (role === "estate_admin" && existing.estate_id !== estateId) {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const { data, error } = await supabaseAdmin
        .from("rental_proposals")
        .update(patch)
        .eq("id", proposalId)
        .select(PROPOSAL_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { proposal: data }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
