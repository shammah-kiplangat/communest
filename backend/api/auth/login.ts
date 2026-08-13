import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, supabasePublic } from '../../lib/supabase'
import { sendJson, sendOptions, parseJson } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return sendOptions(res, req)
  }

  if (req.method !== 'POST') {
    return sendJson(res, req, { error: 'Method Not Allowed' }, 405)
  }

  const body = parseJson(req)
  const { email, password } = body
console.log('Login request body:', body)
  if (!email || !password) {
    return sendJson(res, req, { error: 'Email and password are required' }, 400)
  }

  const {
    data: signInData,
    error: signInError,
  } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData?.session || !signInData.user) {
    return sendJson(res, req, { error: signInError?.message || 'Invalid credentials' }, 401)
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at')
    .eq('id', signInData.user.id)
    .single()

  if (profileError || !profile) {
    return sendJson(res, req, { error: profileError?.message || 'Unable to load user profile' }, 500)
  }

  return sendJson(res, req, {
    accessToken: signInData.session.access_token,
    user: profile,
  }, 200)
}
