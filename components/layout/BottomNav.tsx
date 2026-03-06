'use client'

// ============================================================
// BottomNav — Navegación inferior para dispositivos móviles
// Solo visible en pantallas menores a md (768px)
// ============================================================
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/ventas', label: 'Ventas', icon: ShoppingCart },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800">
      <ul className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-yellow-400'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
