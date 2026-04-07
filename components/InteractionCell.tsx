'use client'

import { useState, useRef } from 'react'
import type { Interaction } from '@/lib/queries'
import { formatDate, INTERACTION_COLORS } from '@/components/ui'

const CLOSE_DELAY = 120

export function InteractionCell({ interaction }: { interaction: Interaction | undefined }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!interaction) return <span style={{ fontSize: 13, color: '#4A5568' }}>—</span>

  function enter() {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  function leave() {
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
  }

  const typeColor = INTERACTION_COLORS[interaction.interaction_type ?? ''] ?? '#6B7280'

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={enter} onMouseLeave={leave}>
      <span style={{ fontSize: 13, color: '#8B9BB4', cursor: 'default' }}>
        {interaction.title}
      </span>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 50, top: '100%', left: 0, marginTop: 6,
          background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '14px 16px', minWidth: 240, maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
          onMouseEnter={enter} onMouseLeave={leave}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', marginBottom: 8 }}>
            {interaction.title}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            {interaction.interaction_type && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44`,
              }}>
                {interaction.interaction_type}
              </span>
            )}
            {interaction.interaction_date && (
              <span style={{ fontSize: 12, color: '#4A5568' }}>
                {formatDate(interaction.interaction_date)}
              </span>
            )}
          </div>
          {interaction.attendees.length > 0 && (
            <div style={{ fontSize: 12, color: '#8B9BB4', lineHeight: 1.5, userSelect: 'text' }}>
              <span style={{ color: '#4A5568', marginRight: 4 }}>Attendees:</span>
              {interaction.attendees.join(', ')}
            </div>
          )}
        </div>
      )}
    </span>
  )
}
