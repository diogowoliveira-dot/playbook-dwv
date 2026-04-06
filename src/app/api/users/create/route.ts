import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha sao obrigatorios' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Create user via admin API (auto-confirms email, doesn't affect current session)
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: role || 'user' },
    })

    if (authError) {
      console.error('Auth create error:', authError)
      // Check for duplicate email
      if (authError.message?.includes('already been registered') || authError.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Este email ja esta cadastrado' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuario' }, { status: 500 })
    }

    // The trigger should auto-create the profile, but let's ensure the role is correct
    if (role === 'master') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'master' })
        .eq('id', userData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Profile might not exist yet if trigger is slow, create it
        await supabase.from('profiles').upsert({
          id: userData.user.id,
          name,
          email,
          role: 'master',
        })
      }
    }

    // Send welcome email via SparkPost if configured
    const sparkpostKey = process.env.SPARKPOST_API_KEY
    if (sparkpostKey) {
      try {
        await fetch('https://api.sparkpost.com/api/v1/transmissions', {
          method: 'POST',
          headers: {
            'Authorization': sparkpostKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [{ address: { email, name } }],
            content: {
              from: { email: 'noreply@dwvapp.com.br', name: 'Playbook DWV' },
              subject: 'Bem-vindo ao Playbook DWV',
              html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #0D0D0D; color: #fff; padding: 32px; border-radius: 12px;">
                  <h1 style="color: #E8392A; font-size: 24px; margin-bottom: 16px;">Playbook DWV</h1>
                  <p>Ola <strong>${name}</strong>,</p>
                  <p>Sua conta foi criada no Playbook DWV — a central de materiais da equipe comercial.</p>
                  <p><strong>Seus dados de acesso:</strong></p>
                  <p style="background: #1A1A1A; padding: 12px; border-radius: 8px;">
                    Email: <strong>${email}</strong><br/>
                    Senha: <strong>${password}</strong>
                  </p>
                  <a href="https://playbook-dwv.vercel.app/login" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #E8392A; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Playbook</a>
                  <p style="color: #888; font-size: 12px; margin-top: 24px;">DWV — Gestao de Parcerias Imobiliarias</p>
                </div>
              `,
            },
          }),
        })
      } catch (emailErr) {
        console.error('Email send error:', emailErr)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      user: { id: userData.user.id, email, name, role: role || 'user' },
    })
  } catch (err) {
    console.error('Create user error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
