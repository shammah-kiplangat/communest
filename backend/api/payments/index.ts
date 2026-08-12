import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions, parseJson } from "../../lib/auth";

const PAYMENT_FIELDS =
  "id,estate_id,house_id,tenant_id,amount,type,status,due_date,paid_at,created_at";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method === "GET") {
    try {
      const { role, estateId, userId } = await requireAuth(req);
      let query = supabaseAdmin.from("payments").select(PAYMENT_FIELDS);
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
        query = query.eq("tenant_id", userId);
      }
      const { data, error } = await query;
      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { payments: data ?? [] }, 200);
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
      const required = [
        "estateId",
        "houseId",
        "tenantId",
        "amount",
        "type",
        "dueDate",
      ];
      for (const field of required) {
        if (!body[field]) {
          return sendJson(res, req, { error: `Missing field ${field}` }, 400);
        }
      }
      if (!["rent", "water", "electricity"].includes(body.type)) {
        return sendJson(res, req, { error: "Invalid payment type" }, 400);
      }
      if (role === "estate_admin" && body.estateId !== estateId) {
        return sendJson(
          res,
          req,
          { error: "Cannot create payments outside your estate" },
          403,
        );
      }

      const { data, error } = await supabaseAdmin
        .from("payments")
        .insert([
          {
            estate_id: body.estateId,
            house_id: body.houseId,
            tenant_id: body.tenantId,
            amount: body.amount,
            type: body.type,
            status: body.status || "due",
            due_date: body.dueDate,
            paid_at: body.paidAt || null,
          },
        ])
        .select(PAYMENT_FIELDS)
        .single();

      if (error) return sendJson(res, req, { error: error.message }, 500);
      return sendJson(res, req, { payment: data }, 201);
    } catch {
      return sendJson(res, req, { error: "Unauthorized" }, 401);
    }
  }

  return sendJson(res, req, { error: "Method Not Allowed" }, 405);
}
