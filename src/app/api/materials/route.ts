import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyMaster } from '@/lib/api-auth'

// POST — Create material (master only)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyMaster(req)
    if (!auth) {
      return NextResponse.json({ error: 'Apenas masters autenticados podem criar materiais' }, { status: 403 })
    }

    const { title, description, category, type, visibility, links } = await req.json()

    if (!title || !category || !type) {
      return NextResponse.json({ error: 'Campos obrigatorios: title, category, type' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Insert material
    const { data: material, error } = await supabase
      .from('materials')
      .insert({ title, description: description || null, category, type, visibility: visibility || 'all', created_by: auth.userId })
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
      }
    }

    return NextResponse.json({ material })
  } catch (err) {
    console.error('Create material error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT — Update material (master only)
export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyMaster(req)
    if (!auth) {
      return NextResponse.json({ error: 'Apenas masters autenticados podem editar materiais' }, { status: 403 })
    }

    const { id, title, description, category, visibility, links } = await req.json()

    if (!id || !title || !category) {
      return NextResponse.json({ error: 'Campos obrigatorios: id, title, category' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const primaryType = links && links.length > 0 ? links[0].type : 'link'

    const { error } = await supabase
      .from('materials')
      .update({ title, description: description || null, category, type: primaryType, visibility: visibility || 'all' })
      .eq('id', id)

    if (error) {
      console.error('Material update error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar material: ' + error.message }, { status: 500 })
    }

    // Replace links — delete old, insert new
    const { error: deleteErr } = await supabase.from('material_links').delete().eq('material_id', id)
    if (deleteErr) {
      console.error('Links delete error:', deleteErr)
      return NextResponse.json({ error: 'Erro ao atualizar links: ' + deleteErr.message }, { status: 500 })
    }

    if (links && links.length > 0) {
      const linkRows = links.map((l: { label: string; url: string; type: string }, i: number) => ({
        material_id: id,
        label: l.label || 'Link',
        url: l.url,
        type: l.type || 'link',
        sort_order: i,
      }))
      const { error: linkErr } = await supabase.from('material_links').insert(linkRows)
      if (linkErr) {
        console.error('Links update error:', linkErr)
        return NextResponse.json({ error: 'Erro ao inserir links: ' + linkErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update material error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE — Delete material (master only)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyMaster(req)
    if (!auth) {
      return NextResponse.json({ error: 'Apenas masters autenticados podem deletar materiais' }, { status: 403 })
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
    }

    const supabase = createServiceClient()

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
