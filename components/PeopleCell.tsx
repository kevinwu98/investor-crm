'use client'

import { useState, useRef } from 'react'
import type { Person } from '@/lib/queries'

const SHOW = 3
const CLOSE_DELAY = 120 // ms — bridges the gap between trigger and popup

function useDelayedHover() {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function enter() {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  function leave() {
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
  }
  return { open, enter, leave }
}

const popupBase: React.CSSProperties = {
  position: 'absolute', zIndex: 50, top: '100%', left: 0, marginTop: 6,
  background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '14px 16px', minWidth: 220, maxWidth: 280,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

function PersonPopup({
  person, enter, leave,
}: {
  person: Person
  enter: () => void
  leave: () => void
}) {
  return (
    <div style={popupBase} onMouseEnter={enter} onMouseLeave={leave}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', marginBottom: 6 }}>
        {person.full_name}
      </div>
      {person.headline && (
        <div style={{ fontSize: 12, color: '#8B9BB4', marginBottom: 8, lineHeight: 1.4 }}>
          {person.headline}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {person.email && (
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#4F83CC' }}>✉</span>{' '}
            <a href={`mailto:${person.email}`} style={{ color: '#8B9BB4' }}>{person.email}</a>
          </div>
        )}
        {person.location && (
          <div style={{ fontSize: 12, color: '#8B9BB4' }}>
            <span>📍</span> {person.location}
          </div>
        )}
        {person.linkedin_url && (
          <a href={person.linkedin_url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#4F83CC' }}>LinkedIn →</a>
        )}
      </div>
    </div>
  )
}

// A single name inside the "+N more" dropdown, with its own person card on hover
function MoreRow({ person }: { person: Person }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <div style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <div style={{
        padding: '7px 16px', fontSize: 13, color: '#D4DBE8', cursor: 'default',
        background: open ? 'rgba(255,255,255,0.05)' : 'transparent',
        userSelect: 'text',
      }}>
        {person.full_name}
      </div>
      {open && (
        // Side card: appears to the right of the dropdown
        <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 6, zIndex: 51 }}>
          <PersonPopup person={person} enter={enter} leave={leave} />
        </div>
      )}
    </div>
  )
}

// "+N more" trigger and its dropdown
function MoreTrigger({ people }: { people: Person[] }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <span style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <span style={{ fontSize: 12, color: '#4F83CC', cursor: 'default', fontWeight: 600 }}>
        +{people.length} more
      </span>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 50, top: '100%', left: 0, marginTop: 6,
          background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '8px 0', minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
          onMouseEnter={enter} onMouseLeave={leave}
        >
          {people.map(p => <MoreRow key={p.id} person={p} />)}
        </div>
      )}
    </span>
  )
}

// A visible name with person card on hover
function PersonTrigger({ person, comma }: { person: Person; comma: boolean }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <span style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <span style={{ fontSize: 13, color: '#8B9BB4', cursor: 'default', userSelect: 'text' }}>
        {person.full_name}
      </span>
      {comma && <span style={{ color: '#4A5568', marginRight: 4 }}>,</span>}
      {open && <PersonPopup person={person} enter={enter} leave={leave} />}
    </span>
  )
}

export function PeopleCell({ people }: { people: Person[] }) {
  if (people.length === 0) return <span style={{ fontSize: 13, color: '#4A5568' }}>—</span>

  const visible = people.slice(0, SHOW)
  const rest = people.slice(SHOW)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0', alignItems: 'center' }}>
      {visible.map((p, i) => (
        <PersonTrigger
          key={p.id}
          person={p}
          comma={i < visible.length - 1 || rest.length > 0}
        />
      ))}
      {rest.length > 0 && <MoreTrigger people={rest} />}
    </div>
  )
}
