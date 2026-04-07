'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',               label: 'Dashboard' },
  { href: '/organizations',  label: 'Organizations' },
  { href: '/interactions',   label: 'Interactions' },
  { href: '/search',         label: 'AI Search' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: '#0D1117',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: '#374151', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Capital Network
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif', marginTop: 2 }}>
          Investor CRM
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'block', padding: '10px 12px',
              borderRadius: 8, marginBottom: 2,
              background: active ? 'rgba(79,131,204,0.15)' : 'transparent',
              color: active ? '#A8C4E8' : '#4A5568',
              border: active ? '1px solid rgba(79,131,204,0.2)' : '1px solid transparent',
              fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4' }}>Kevin Wu</div>
        <div style={{ fontSize: 11, color: '#374151' }}>a16z Capital Network</div>
      </div>
    </div>
  )
}
