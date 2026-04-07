'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, resetPassword } from '@/lib/database'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess('Email de recuperacao enviado! Verifique sua caixa de entrada e spam.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email')
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
          {mode === 'login' ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-5">Entrar</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-dwv-muted uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-dwv-muted uppercase tracking-wider">Senha</label>
                  <div className="relative mt-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50 pr-16"
                      placeholder="Sua senha"
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

                {error && <p className="text-xs text-dwv-red bg-dwv-red/10 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-dwv-red hover:bg-dwv-red-dark text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <button
                onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                className="w-full mt-4 text-sm text-dwv-muted hover:text-dwv-red transition-colors"
              >
                Esqueci minha senha
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Recuperar Senha</h2>
              <p className="text-xs text-dwv-muted mb-5">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="text-xs text-dwv-muted uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
                    placeholder="email@exemplo.com"
                  />
                </div>

                {error && <p className="text-xs text-dwv-red bg-dwv-red/10 rounded-lg px-3 py-2">{error}</p>}
                {success && <p className="text-xs text-dwv-green bg-dwv-green/10 rounded-lg px-3 py-2">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-dwv-red hover:bg-dwv-red-dark text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperacao'}
                </button>
              </form>

              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="w-full mt-4 text-sm text-dwv-muted hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
