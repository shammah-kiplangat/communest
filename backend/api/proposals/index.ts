import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const PROPOSAL_FIELDS =
  "id,estate_id,house_id,applicant_id,applicant_name,applicant_email,applicant_phone,message,status,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      let query = supabaseAdmin
        .from("rental_proposals")
        .select(PROPOSAL_FIELDS);
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
      if (role === "estate_admin") {
        query = query.eq("estate_id", estateId);
      }
      if (role === "tenant") {
        query = query.eq("applicant_id", userId);
      }
      const { data, error } = await query;
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { proposals: data ?? [] }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "POST") {
    try {
      const { userId } = await requireAuth(req);
      const body = parseJson(req);
      const required = [
        "estateId",
        "houseId",
        "applicantName",
        "applicantEmail",
        "applicantPhone",
      ];
      for (const field of required) {
        if (!body[field]) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }
      const { data, error } = await supabaseAdmin
        .from("rental_proposals")
        .insert([
          {
            estate_id: body.estateId,
            house_id: body.houseId,
            applicant_id: userId,
            applicant_name: body.applicantName,
            applicant_email: body.applicantEmail,
            applicant_phone: body.applicantPhone,
            message: body.message || null,
            status: "pending",
          },
        ])
        .select(PROPOSAL_FIELDS)
        .single();
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { proposal: data }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
