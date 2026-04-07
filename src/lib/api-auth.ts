import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from './supabase-server'

interface AuthResult {
  userId: string
  role: 'master' | 'user'
}

/**
 * Verify the caller's identity from the Authorization header.
 * Returns the authenticated user's ID and role, or null if unauthenticated.
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult | null> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return null

  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    if (!user) return null

    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return { userId: user.id, role: profile.role }
  } catch {
    return null
  }
}

/**
 * Verify that the caller is an authenticated master user.
 * Returns the auth result or null.
 */
export async function verifyMaster(req: NextRequest): Promise<AuthResult | null> {
  const auth = await verifyAuth(req)
  if (!auth || auth.role !== 'master') return null
  return auth
}
