import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// POST — Create material
export async function POST(req: NextRequest) {
  try {
    const { title, description, category, type, createdBy, links } = await req.json()

    if (!title || !category || !type) {
      return NextResponse.json({ error: 'Campos obrigatorios: title, category, type' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify user is master
    if (createdBy) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', createdBy)
        .single()

      if (!profile || profile.role !== 'master') {
        return NextResponse.json({ error: 'Apenas masters podem criar materiais' }, { status: 403 })
      }
    }

    // Insert material
    const { data: material, error } = await supabase
      .from('materials')
      .insert({ title, description: description || null, category, type, created_by: createdBy || null })
      .select()
      .single()

    if (error) {
      console.error('Material insert error:', error)
      return NextResponse.json({ error: 'Erro ao criar material: ' + error.message }, { status: 500 })
    }

    // Insert links
    if (links && links.length > 0) {
      const linkRows = links.map((l: { label: string; url: string; type: string }, i: number) => ({
        material_id: material.id,
        label: l.label || 'Link',
        url: l.url,
        type: l.type || 'link',
        sort_order: i,
      }))
      const { error: linkErr } = await supabase.from('material_links').insert(linkRows)
      if (linkErr) {
        console.error('Links insert error:', linkErr)
        // Don't fail — material was created, just log the error
      }
    }

    return NextResponse.json({ material })
  } catch (err) {
    console.error('Create material error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT — Update material
export async function PUT(req: NextRequest) {
  try {
    const { id, title, description, category, links, userId } = await req.json()

    if (!id || !title || !category) {
      return NextResponse.json({ error: 'Campos obrigatorios: id, title, category' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify user is master
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || profile.role !== 'master') {
        return NextResponse.json({ error: 'Apenas masters podem editar materiais' }, { status: 403 })
      }
    }

    const primaryType = links && links.length > 0 ? links[0].type : 'link'

    const { error } = await supabase
      .from('materials')
      .update({ title, description: description || null, category, type: primaryType })
      .eq('id', id)

    if (error) {
      console.error('Material update error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar material: ' + error.message }, { status: 500 })
    }

    // Replace links
    await supabase.from('material_links').delete().eq('material_id', id)
    if (links && links.length > 0) {
      const linkRows = links.map((l: { label: string; url: string; type: string }, i: number) => ({
        material_id: id,
        label: l.label || 'Link',
        url: l.url,
        type: l.type || 'link',
        sort_order: i,
      }))
      const { error: linkErr } = await supabase.from('material_links').insert(linkRows)
      if (linkErr) console.error('Links update error:', linkErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update material error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE — Delete material
export async function DELETE(req: NextRequest) {
  try {
    const { id, userId } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify user is master
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || profile.role !== 'master') {
        return NextResponse.json({ error: 'Apenas masters podem deletar materiais' }, { status: 403 })
      }
    }

    const { error } = await supabase.from('materials').delete().eq('id', id)

    if (error) {
      console.error('Material delete error:', error)
      return NextResponse.json({ error: 'Erro ao deletar material: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete material error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
