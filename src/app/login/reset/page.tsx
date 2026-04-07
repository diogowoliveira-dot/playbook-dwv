'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { updatePassword } from '@/lib/database'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    // and establishes a session when the page loads
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
      if (event === 'SIGNED_IN') {
        setSessionReady(true)
      }
    })

    // Also check if there's already a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres')
      return
    }

    if (password !== confirm) {
      setError('As senhas nao coincidem')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dwv-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://site.dwvapp.com.br/wp-content/uploads/2025/07/cropped-cropped-Prancheta-1@2x-8.png"
            alt="DWV"
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold tracking-wider">PLAYBOOK DWV</h1>
          <p className="text-sm text-dwv-muted mt-1">Central de Materiais</p>
        </div>

        {/* Card */}
        <div className="bg-dwv-card border border-dwv-border rounded-2xl p-6 animate-fade-in-up">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-dwv-green/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-dwv-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Senha Redefinida!</h2>
              <p className="text-sm text-dwv-muted">Redirecionando para o sistema...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-dwv-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-dwv-muted">Verificando link de recuperacao...</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-sm text-dwv-muted hover:text-dwv-red transition-colors"
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Redefinir Senha</h2>
              <p className="text-xs text-dwv-muted mb-5">Escolha uma nova senha para sua conta.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-dwv-muted uppercase tracking-wider">Nova Senha</label>
                  <div className="relative mt-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50 pr-16"
                      placeholder="Minimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dwv-muted hover:text-white"
                    >
                      {showPw ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-dwv-muted uppercase tracking-wider">Confirmar Senha</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
                    placeholder="Repita a nova senha"
                  />
                </div>

                {error && <p className="text-xs text-dwv-red bg-dwv-red/10 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-dwv-red hover:bg-dwv-red-dark text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Redefinir Senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
