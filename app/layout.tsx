import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Investor CRM',
  description: 'Capital Network Investor CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
          <Sidebar />
          <main style={{
            flex: 1,
            padding: '40px 48px',
            overflowY: 'auto',
            minWidth: 0,
            color: '#F0F4FF',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
