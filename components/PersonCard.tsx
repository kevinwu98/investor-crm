'use client'
import { useState, useRef } from 'react'

export function PersonCard({
  person, children,
}: {
  person: { full_name: string; email?: string | null; headline?: string | null; location?: string | null; linkedin_url?: string | null }
  children: React.ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleMouseEnter() {
    timer.current = setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect()
      if (rect) setPos({ x: rect.left, y: rect.bottom + 8 })
      setVisible(true)
    }, 300)
  }

  function handleMouseLeave() {
    clearTimeout(timer.current)
    setVisible(false)
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(255,255,255,0.25)' }}
      >
        {children}
      </span>
      {visible && (
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
          background: '#1C2333', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, padding: '14px 16px', width: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#F0F4FF', marginBottom: 3 }}>{person.full_name}</div>
          {person.headline && (
            <div style={{ fontSize: 12, color: '#8B9BB4', marginBottom: 8, lineHeight: 1.4 }}>{person.headline}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {person.location && (
              <div style={{ fontSize: 12, color: '#6B7A94' }}>📍 {person.location}</div>
            )}
            {person.email && <div style={{ fontSize: 12, color: '#6B7A94' }}>✉ {person.email}</div>}
            {person.linkedin_url && (
              <a href={person.linkedin_url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: '#4F83CC', marginTop: 4 }}>
                View LinkedIn →
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
