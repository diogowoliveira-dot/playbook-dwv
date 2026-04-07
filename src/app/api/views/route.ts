import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// GET — Get all views for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatorio' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('material_views')
      .select('material_id, viewed_at')
      .eq('user_id', userId)

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

// POST — Mark material as viewed (upsert — updates viewed_at if already exists)
export async function POST(req: NextRequest) {
  try {
    const { userId, materialId } = await req.json()
    if (!userId || !materialId) {
      return NextResponse.json({ error: 'userId e materialId obrigatorios' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('material_views')
      .upsert(
        { user_id: userId, material_id: materialId, viewed_at: new Date().toISOString() },
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
