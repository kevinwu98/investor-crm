// ── Types ─────────────────────────────────────────────────────────────────────

export const TYPE_COLORS: Record<string, string> = {
  VC: '#4F83CC', Growth: '#34A98F', PE: '#9B6FD4',
  CVC: '#E8834A', Strategic: '#D4A843', 'Family Office': '#6B8FA3',
  SWF: '#4A9E8B', 'Hedge Fund': '#8B6B4A', Other: '#6B7280',
  Crossover: '#C45FAA', Bank: '#5FA8C4', Angel: '#C4A85F',
}

export const INTERACTION_COLORS: Record<string, string> = {
  Meeting: '#4F83CC', Intro: '#34A98F', Outreach: '#E8834A',
  'Follow-up': '#9B6FD4', Other: '#6B7280',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatCheckSize(min: number | null, max: number | null) {
  if (!min && !max) return '—'
  if (min && max) return `$${min}M – $${max}M`
  if (min) return `$${min}M+`
  return `Up to $${max}M`
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: `${color}22`, color, border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

export function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent: string
}) {
  return (
    <div style={{
      background: '#111827', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '20px 24px',
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 12, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#34A98F', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 64 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(79,131,204,0.2)',
        borderTopColor: '#4F83CC',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

export function BarChart({ data }: { data: { month: string; interactions: number }[] }) {
  const max = Math.max(...data.map(d => d.interactions), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            height: `${(d.interactions / max) * 64}px`,
            minHeight: 4,
            background: i === data.length - 1 ? '#4F83CC' : 'rgba(79,131,204,0.35)',
          }} />
          <div style={{ fontSize: 10, color: '#4A5568', fontFamily: 'monospace' }}>{d.month}</div>
        </div>
      ))}
    </div>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

export function DonutChart({ data }: { data: { type: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return null
  let cumulative = 0
  const cx = 50, cy = 50, r = 36

  const segments = data.map(d => {
    const pct = d.count / total
    const start = cumulative
    cumulative += pct
    const startAngle = start * 2 * Math.PI - Math.PI / 2
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
    const largeArc = pct > 0.5 ? 1 : 0
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {segments.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.9} />)}
        <circle cx={cx} cy={cy} r={r - 14} fill="#111827" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#8B9BB4' }}>{d.type}</span>
            <span style={{ fontSize: 12, color: '#F0F4FF', fontWeight: 600, marginLeft: 'auto', paddingLeft: 16 }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
