import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const PAYMENT_OPTION_FIELDS = "id,estate_id,method,details,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    try {
      const { role, estateId } = await requireAuth(req);
      let query = supabaseAdmin
        .from("payment_options")
        .select(PAYMENT_OPTION_FIELDS);
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
      return sendJson(res, req, { paymentOptions: data ?? [] }, 200);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  if (req.method === "POST") {
    try {
      const { role, estateId } = await requireAuth(req);
      if (role !== "estate_admin" && role !== "communest_admin") {
        return sendJson(res, req, { error: "Forbidden" }, 403);
      }

      const body = parseJson(req);
      const required = ["estateId", "method", "details"];
      for (const field of required) {
        if (!body[field]) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }

      if (role === "estate_admin" && body.estateId !== estateId) {
        return sendJson(
          res,
          req,
          { error: "Cannot create payment options outside your estate" },
          403,
        );
      }

      const { data, error } = await supabaseAdmin
        .from("payment_options")
        .insert([
          {
            estate_id: body.estateId,
            method: body.method,
            details: body.details,
          },
        ])
        .select(PAYMENT_OPTION_FIELDS)
        .single();

      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { paymentOption: data }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
