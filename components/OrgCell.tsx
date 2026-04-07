'use client'

import { useState, useRef } from 'react'
import type { OrgSummary } from '@/lib/queries'

const SHOW = 2
const CLOSE_DELAY = 120

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

function OrgPopup({ org, enter, leave }: { org: OrgSummary; enter: () => void; leave: () => void }) {
  return (
    <div
      style={{
        position: 'absolute', zIndex: 50, top: '100%', left: 0, marginTop: 6,
        background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '14px 16px', minWidth: 240, maxWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={enter} onMouseLeave={leave}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', marginBottom: 4 }}>
        {org.name}
      </div>
      {org.website && (
        <a href={`https://${org.website}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: '#4A5568', display: 'block', marginBottom: 8 }}>
          {org.website}
        </a>
      )}
      {org.description && (
        <div style={{ fontSize: 12, color: '#8B9BB4', lineHeight: 1.5, marginBottom: 8 }}>
          {org.description.length > 140 ? org.description.slice(0, 140) + '…' : org.description}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {org.sectors.length > 0 && (
          <div style={{ fontSize: 11, color: '#4A5568' }}>
            <span style={{ color: '#E8834A' }}>Sectors: </span>
            <span style={{ color: '#8B9BB4' }}>{org.sectors.join(', ')}</span>
          </div>
        )}
        {org.stages.length > 0 && (
          <div style={{ fontSize: 11, color: '#4A5568' }}>
            <span style={{ color: '#4F83CC' }}>Stage: </span>
            <span style={{ color: '#8B9BB4' }}>{org.stages.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function OrgTrigger({ org, comma }: { org: OrgSummary; comma: boolean }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <span style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <span style={{ fontSize: 13, color: '#8B9BB4', cursor: 'default' }}>
        {org.name}
      </span>
      {comma && <span style={{ color: '#4A5568', marginRight: 4 }}>,</span>}
      {open && <OrgPopup org={org} enter={enter} leave={leave} />}
    </span>
  )
}

function MoreOrgRow({ org }: { org: OrgSummary }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <div style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <div style={{
        padding: '7px 16px', fontSize: 13, color: '#D4DBE8', cursor: 'default',
        background: open ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}>
        {org.name}
      </div>
      {open && (
        <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 6, zIndex: 51 }}>
          <OrgPopup org={org} enter={enter} leave={leave} />
        </div>
      )}
    </div>
  )
}

function MoreOrgTrigger({ orgs }: { orgs: OrgSummary[] }) {
  const { open, enter, leave } = useDelayedHover()
  return (
    <span style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <span style={{ fontSize: 12, color: '#4F83CC', cursor: 'default', fontWeight: 600 }}>
        +{orgs.length} more
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
          {orgs.map(o => <MoreOrgRow key={o.id} org={o} />)}
        </div>
      )}
    </span>
  )
}

export function OrgCell({ orgs }: { orgs: OrgSummary[] }) {
  if (orgs.length === 0) return <span style={{ fontSize: 13, color: '#4A5568' }}>—</span>

  const visible = orgs.slice(0, SHOW)
  const rest = orgs.slice(SHOW)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0', alignItems: 'center' }}>
      {visible.map((o, i) => (
        <OrgTrigger key={o.id} org={o} comma={i < visible.length - 1 || rest.length > 0} />
      ))}
      {rest.length > 0 && <MoreOrgTrigger orgs={rest} />}
    </div>
  )
}
