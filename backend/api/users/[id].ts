import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAuth, sendJson, sendOptions, parseJson } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return sendOptions(res, req)
  }

  const userId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!userId) {
    return sendJson(res, req, { error: 'User ID is required' }, 400)
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at')
      .eq('id', userId)
      .single()
    if (error) return sendJson(res, req, { error: error.message }, 404)
    return sendJson(res, req, { user: data }, 200)
  }

  if (req.method === 'PATCH') {
    try {
      const { role, estateId, userId: requesterId } = await requireAuth(req)
      const updates = parseJson(req)
      const allowedFields = ['full_name', 'phone', 'profile_picture', 'role', 'estate_id', 'email_verified', 'phone_verified']
      const patch: Record<string, unknown> = {}
      for (const key of allowedFields) {
        if (key in updates) patch[key] = updates[key as keyof typeof updates]
      }
      if (Object.keys(patch).length === 0) {
        return sendJson(res, req, { error: 'No valid update fields provided' }, 400)
      }

      if (requesterId !== userId && role !== 'communest_admin') {
        if (role === 'estate_admin' && patch.role === 'estate_admin' && patch.estate_id === estateId) {
          // estate admin may promote a user to estate_admin within their estate
        } else {
          return sendJson(res, req, { error: 'Forbidden' }, 403)
        }
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(patch)
        .eq('id', userId)
        .select('id,full_name,email,phone,role,estate_id,profile_picture,email_verified,phone_verified,created_at')
        .single()

      if (error) return sendJson(res, req, { error: error.message }, 500)
      return sendJson(res, req, { user: data }, 200)
    } catch {
      return sendJson(res, req, { error: 'Unauthorized' }, 401)
    }
  }

  return sendJson(res, req, { error: 'Method Not Allowed' }, 405)
}
