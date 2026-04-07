import { getInteractions, getInteractionTypes } from '@/lib/queries'
import { formatDate, INTERACTION_COLORS } from '@/components/ui'
import { PeopleCell } from '@/components/PeopleCell'
import { OrgCell } from '@/components/OrgCell'
import Link from 'next/link'

const PAGE_SIZE = 25

function qs(params: Record<string, string>) {
  return '?' + new URLSearchParams(params).toString()
}

export async function InteractionsTable({
  q, type, page,
}: {
  q: string
  type: string
  page: number
}) {
  const offset = (page - 1) * PAGE_SIZE
  const [interactions, types] = await Promise.all([
    getInteractions({ search: q, type, limit: PAGE_SIZE + 1, offset }),
    getInteractionTypes(),
  ])

  const hasNext = interactions.length > PAGE_SIZE
  const rows = interactions.slice(0, PAGE_SIZE)

  const linkParams = (overrides: Record<string, string>) =>
    qs({ q, type, page: String(page), ...overrides })

  const tagStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '6px 12px', borderRadius: 6,
    fontSize: 12, fontWeight: 600, textDecoration: 'none',
    background: active ? '#4F83CC' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#8B9BB4',
    border: active ? '1px solid #4F83CC' : '1px solid rgba(255,255,255,0.08)',
  })

  return (
    <>
      {/* Type filter tags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {types.map(t => (
            <Link key={t} href={linkParams({ type: t, page: '1' })} style={tagStyle(type === t)}>
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 13, color: '#4A5568' }}>
          {rows.length === 0 ? 'No interactions found' : `Showing ${offset + 1}–${offset + rows.length}${hasNext ? '+' : ''}`}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '9%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Type', 'Title', 'Attendees', 'Organizations', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#4A5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((int, i) => (
              <tr key={int.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '14px 20px' }}>
                  {int.interaction_type && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: `${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}22`,
                      color: INTERACTION_COLORS[int.interaction_type] ?? '#6B7280',
                      border: `1px solid ${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}44`,
                    }}>{int.interaction_type}</span>
                  )}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#D4DBE8', fontWeight: 500 }}>
                  {int.title}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <PeopleCell people={int.people_list} />
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <OrgCell orgs={int.orgs_list} />
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: '#4A5568', whiteSpace: 'nowrap' }}>
                  {formatDate(int.interaction_date ?? null)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#4A5568' }}>No interactions found.</td></tr>
            )}
          </tbody>
        </table>

        {(page > 1 || hasNext) && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {page > 1
              ? <Link href={linkParams({ page: String(page - 1) })} style={{ fontSize: 13, color: '#4F83CC' }}>← Previous</Link>
              : <span />}
            <span style={{ fontSize: 12, color: '#4A5568' }}>Page {page}</span>
            {hasNext
              ? <Link href={linkParams({ page: String(page + 1) })} style={{ fontSize: 13, color: '#4F83CC' }}>Next →</Link>
              : <span />}
          </div>
        )}
      </div>
    </>
  )
}
