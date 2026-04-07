import { Suspense } from 'react'
import { InteractionsTable } from './InteractionsTable'

function TableSkeleton() {
  const shimmer: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', borderRadius: 4,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Type tag placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...shimmer, height: 14, width: 36, borderRadius: 3 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[40, 70, 50, 80, 65, 55].map((w, i) => (
            <div key={i} style={{ ...shimmer, height: 30, width: w, borderRadius: 6 }} />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ ...shimmer, height: 13, width: 120 }} />
        </div>
        <div style={{ display: 'flex', padding: '12px 20px', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[70, 180, 200, 200, 100].map((w, i) => (
            <div key={i} style={{ ...shimmer, height: 11, width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', padding: '18px 20px', gap: 20, alignItems: 'center',
            borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div style={{ ...shimmer, height: 20, width: 70, borderRadius: 4 }} />
            <div style={{ ...shimmer, height: 14, width: 180 }} />
            <div style={{ ...shimmer, height: 13, width: 200 }} />
            <div style={{ ...shimmer, height: 13, width: 200 }} />
            <div style={{ ...shimmer, height: 13, width: 100 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function InteractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>
}) {
  const { q = '', type = 'All', page = '1' } = await searchParams
  const pageNum = Math.max(1, parseInt(page) || 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>Interactions</h1>
      </div>

      {/* Search — renders instantly, preserves active type filter */}
      <form>
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, attendee, or organization..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 16px', color: '#F0F4FF', fontSize: 14, outline: 'none',
          }}
        />
      </form>

      {/* Table + type filters stream in */}
      <Suspense key={`${q}-${type}-${pageNum}`} fallback={<TableSkeleton />}>
        <InteractionsTable q={q} type={type} page={pageNum} />
      </Suspense>
    </div>
  )
}
