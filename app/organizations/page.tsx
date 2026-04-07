import { Suspense } from 'react'
import Link from 'next/link'
import { OrgsTable } from './OrgsTable'
import { OrgExportButton } from '@/components/ExportButton'

const SECTORS = ['All', 'AD', 'Consumer', 'Enterprise', 'Fintech', 'Games']

function TableSkeleton() {
  const shimmer: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', borderRadius: 4, animation: 'none',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stage tag placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...shimmer, height: 14, width: 40, borderRadius: 3 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[60, 50, 70, 65, 55, 80, 60].map((w, i) => (
            <div key={i} style={{ ...shimmer, height: 30, width: w, borderRadius: 6 }} />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ ...shimmer, height: 13, width: 120 }} />
        </div>
        {/* Header row */}
        <div style={{ display: 'flex', padding: '12px 20px', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[120, 220, 180, 160, 70, 60].map((w, i) => (
            <div key={i} style={{ ...shimmer, height: 11, width: w }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', padding: '18px 20px', gap: 20,
            borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'flex-start',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 120, flexShrink: 0 }}>
              <div style={{ ...shimmer, height: 14, width: '90%' }} />
              <div style={{ ...shimmer, height: 11, width: '60%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 220, flexShrink: 0 }}>
              <div style={{ ...shimmer, height: 13, width: '100%' }} />
              <div style={{ ...shimmer, height: 13, width: '80%' }} />
            </div>
            <div style={{ ...shimmer, height: 13, width: 180, flexShrink: 0 }} />
            <div style={{ ...shimmer, height: 13, width: 160, flexShrink: 0 }} />
            <div style={{ ...shimmer, height: 13, width: 70, flexShrink: 0 }} />
            <div style={{ ...shimmer, height: 13, width: 60, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string; stage?: string; page?: string }>
}) {
  const { q = '', sector = 'All', stage = 'All', page = '1' } = await searchParams
  const pageNum = Math.max(1, parseInt(page) || 1)

  const sectorHref = (s: string) => {
    const p = new URLSearchParams({ q, sector: s, stage, page: '1' })
    return `/organizations?${p}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>Organizations</h1>
        <OrgExportButton q={q} sector={sector} stage={stage} />
      </div>

      {/* Search + sector filters — no data fetching, renders instantly */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <form style={{ display: 'flex', gap: 8 }}>
          {/* Preserve active filters across search submissions */}
          <input type="hidden" name="sector" value={sector} />
          <input type="hidden" name="stage" value={stage} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or website..."
            style={{
              flex: 1,
              background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '10px 16px', color: '#F0F4FF', fontSize: 14,
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: '#4F83CC', color: '#fff', border: 'none', cursor: 'pointer',
            flexShrink: 0,
          }}>Search</button>
          {q && (
            <Link href={`/organizations?${new URLSearchParams({ sector, stage, page: '1' })}`}
              style={{
                padding: '10px 16px', borderRadius: 8, fontSize: 14,
                background: 'rgba(255,255,255,0.05)', color: '#8B9BB4',
                border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
                flexShrink: 0, display: 'flex', alignItems: 'center',
              }}>
              Clear
            </Link>
          )}
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sector</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SECTORS.map(s => (
              <Link key={s} href={sectorHref(s)} style={{
                display: 'inline-block', padding: '6px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                background: sector === s ? '#E8834A' : 'rgba(255,255,255,0.05)',
                color: sector === s ? '#fff' : '#8B9BB4',
                border: sector === s ? '1px solid #E8834A' : '1px solid rgba(255,255,255,0.08)',
              }}>{s}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table streams in — key forces re-suspension on param changes */}
      <Suspense key={`${q}-${sector}-${stage}-${pageNum}`} fallback={<TableSkeleton />}>
        <OrgsTable q={q} sector={sector} stage={stage} page={pageNum} />
      </Suspense>
    </div>
  )
}
