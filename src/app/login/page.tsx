'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/database'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
        router.push('/dashboard')
      } else {
        await signUp(email, password, name)
        setSuccess('Conta criada! Faca login.')
        setTab('login')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
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
          {/* Tabs */}
          <div className="flex mb-6 bg-dwv-bg2 rounded-lg p-1">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === t ? 'bg-dwv-red text-white' : 'text-dwv-muted hover:text-white'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs text-dwv-muted uppercase tracking-wider">Nome</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
                  placeholder="Seu nome"
                />
              </div>
            )}
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

            {error && <p className="text-xs text-dwv-red bg-dwv-red/10 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-dwv-green bg-dwv-green/10 rounded-lg px-3 py-2">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold bg-dwv-red hover:bg-dwv-red-dark text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : tab === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {/* Dev hint */}
          <div className="mt-4 p-3 rounded-lg bg-dwv-bg2 border border-dwv-border/50">
            <p className="text-[10px] text-dwv-muted">
              <span className="text-dwv-amber">DEV:</span> admin@dwv.com.br / senha configurada no Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
