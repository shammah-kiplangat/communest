import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin, supabasePublic } from "../../lib/supabase";
import { sendJson, sendOptions, parseJson } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return sendOptions(res, req);
  }

  if (req.method !== "POST") {
    return sendJson(res, req, { error: "Method Not Allowed" }, 405);
  }
console.log('Register request body:', req.body);
  const body = parseJson(req);
  const { email, password, full_name, phone } = body;

  if (!email || !password || !full_name) {
    return sendJson(res, req, { error: "Missing required fields" }, 400);
  }

  const { data: userData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

  if (createError || !userData.user) {
    return sendJson(
      res,
      req,
      { error: createError?.message ?? "Unable to create user" },
      500,
    );
  }

  const { error: insertError } = await supabaseAdmin.from("users").insert({
    id: userData.user.id,
    full_name,
    email,
    phone,
    role: "regular_user",
  });

  if (insertError) {
    return sendJson(res, req, { error: insertError.message }, 500);
  }

  const { data: signInData, error: signInError } =
    await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData?.session || !signInData.user) {
    return sendJson(
      res,
      req,
      {
        error: signInError?.message ?? "Unable to sign in after registration",
      },
      500,
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select(
      "id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at",
    )
    .eq("id", signInData.user.id)
    .single();

  if (profileError || !profile) {
    return sendJson(
      res,
      req,
      { error: profileError?.message ?? "Unable to load user profile" },
      500,
    );
  }

  return sendJson(
    res,
    req,
    {
      accessToken: signInData.session.access_token,
      user: profile,
    },
    201,
  );
}
