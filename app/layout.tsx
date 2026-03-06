// ============================================================
// Layout raíz — WatchTracker Ecuador
// Server Component: envuelve toda la app con AppShell
// ============================================================
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

// Carga optimizada de Inter con next/font (no agrega un link tag manual)
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WatchTracker Ecuador',
  description: 'Gestión de importación y reventa de relojes en Ecuador',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans">
        {/* AppShell maneja el sidebar y la navegación */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
