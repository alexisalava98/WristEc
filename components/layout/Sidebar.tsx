'use client'

// ============================================================
// Sidebar — Navegación lateral para desktop
// Colapsable con animación suave
// ============================================================
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Watch,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

// Ítems de navegación
const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/inventario',
    label: 'Inventario',
    icon: Package,
  },
  {
    href: '/ventas',
    label: 'Ventas',
    icon: ShoppingCart,
  },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-full z-40',
        'bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Header del sidebar */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        {/* Ícono del reloj siempre visible */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 shrink-0">
          <Watch className="w-4 h-4 text-gray-900" />
        </div>

        {/* Texto del logo: oculto cuando está colapsado */}
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-white leading-none">WatchTracker</p>
            <p className="text-xs text-gray-400 mt-0.5">Ecuador</p>
          </div>
        )}
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    'transition-all duration-150',
                    isActive
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Botón de colapsar */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 px-3 rounded-lg
                     text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
