import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyAuth } from '@/lib/api-auth'

// GET — Get all views for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('material_views')
      .select('material_id, viewed_at')
      .eq('user_id', auth.userId)

    if (error) {
      console.error('Get views error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ views: data || [] })
  } catch (err) {
    console.error('Get views error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST — Mark material as viewed for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const { materialId } = await req.json()
    if (!materialId) {
      return NextResponse.json({ error: 'materialId obrigatorio' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('material_views')
      .upsert(
        { user_id: auth.userId, material_id: materialId, viewed_at: new Date().toISOString() },
        { onConflict: 'user_id,material_id' }
      )

    if (error) {
      console.error('Mark viewed error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Mark viewed error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
