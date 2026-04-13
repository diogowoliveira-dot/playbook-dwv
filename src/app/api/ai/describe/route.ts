import { NextRequest, NextResponse } from 'next/server'
import { verifyMaster } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyMaster(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, type, category } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Gere uma descricao profissional e concisa (2-3 frases) para um material da DWV (empresa de gestao de parcerias imobiliarias).
Titulo: ${title}
Tipo: ${type}
Categoria: ${category}

A descricao deve ser objetiva, destacar o conteudo principal e para quem se destina. Responda APENAS com a descricao, sem aspas ou prefixos.`,
          },
        ],
      }),
    })

    const data = await response.json()
    const description = data.content?.[0]?.text || ''

    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI describe error:', error)
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
  }
}
