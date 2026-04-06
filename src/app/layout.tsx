import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const mono = Geist_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Playbook DWV',
  description: 'Central de materiais de estudo e venda DWV',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${mono.variable} h-full`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full bg-dwv-bg text-white antialiased"
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
