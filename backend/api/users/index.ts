import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth, sendJson, sendOptions } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return sendOptions(res, req)
  }

  if (req.method !== 'GET') {
    return sendJson(res, req, { error: 'Method Not Allowed' }, 405)
  }

  try {
    const { role, estateId, userId } = await requireAuth(req)
    const { email, estateId: filterEstateId, role: filterRole } = req.query as Record<string, string | string[]>
    let query = supabaseAdmin.from('users').select('id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at')

    if (email) {
      query = query.eq('email', Array.isArray(email) ? email[0] : email)
    }
    if (filterEstateId) {
      query = query.eq('estate_id', Array.isArray(filterEstateId) ? filterEstateId[0] : filterEstateId)
    }
    if (filterRole) {
      query = query.eq('role', Array.isArray(filterRole) ? filterRole[0] : filterRole)
    }

    if (role === 'estate_admin' && !filterEstateId) {
      query = query.eq('estate_id', estateId)
    }

    const { data, error } = await query
    if (error) return sendJson(res, req, { error: error.message }, 500)
    return sendJson(res, req, { users: data ?? [] }, 200)
  } catch {
    return sendJson(res, req, { error: 'Unauthorized' }, 401)
  }
}
