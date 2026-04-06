'use client'

import { useEffect, useState } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error'
}

let toastId = 0
let addToastFn: ((text: string, type: 'success' | 'error') => void) | null = null

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(text, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    addToastFn = (text, type) => {
      const id = ++toastId
      setToasts(prev => [...prev, { id, text, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    return () => { addToastFn = null }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium animate-fade-in-up ${
            t.type === 'success'
              ? 'bg-dwv-green/20 text-dwv-green border border-dwv-green/30'
              : 'bg-dwv-red/20 text-dwv-red border border-dwv-red/30'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
