import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyMaster } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyMaster(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === auth.userId) {
      return NextResponse.json({ error: 'Voce nao pode excluir sua propria conta' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // Delete user from auth (profile cascades)
    const { error } = await serviceClient.auth.admin.deleteUser(userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
