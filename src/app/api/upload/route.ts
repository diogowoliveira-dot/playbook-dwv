import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyAuth } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF sao permitidos' }, { status: 400 })
    }

    // Max 50MB
    if (file.size > 52428800) {
      return NextResponse.json({ error: 'Arquivo excede o limite de 50MB' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `pdfs/${timestamp}_${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('materiais')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Erro ao fazer upload: ' + error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('materiais')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      filename: file.name,
    })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
