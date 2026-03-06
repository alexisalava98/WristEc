'use client'

// ============================================================
// AppShell — Contenedor principal del layout
// Maneja el estado del sidebar colapsable (desktop)
// ============================================================
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  // Estado del sidebar: expandido o colapsado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar solo visible en desktop (md+) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Contenido principal */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          pb-20 md:pb-0
          ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
        `}
      >
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Bottom nav solo visible en móvil */}
      <BottomNav />
    </div>
  )
}
