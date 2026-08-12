import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "../../lib/supabase";
import { requireAuth, sendJson, sendOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method !== "GET") {
    return sendJson(res, req, { error: "Method Not Allowed" }, 405);
  }

  try {
    const { userId } = await requireAuth(req);
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(
        "id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at",
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      return sendJson(
        res,
        req,
        { error: error?.message || "Unable to load profile" },
        500,
      );
    }

    return sendJson(res, req, { user: data }, 200);
  } catch {
    return sendJson(res, req, { error: "Unauthorized" }, 401);
  }
}
