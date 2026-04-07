import Link from 'next/link'
import { getOrganizations, getOrgStages } from '@/lib/queries'
import { PeopleCell } from '@/components/PeopleCell'
import { InteractionCell } from '@/components/InteractionCell'

const PAGE_SIZE = 25

function qs(params: Record<string, string>) {
  return '?' + new URLSearchParams(params).toString()
}

export async function OrgsTable({
  q, sector, stage, page,
}: {
  q: string
  sector: string
  stage: string
  page: number
}) {
  const offset = (page - 1) * PAGE_SIZE
  const [orgs, stages] = await Promise.all([
    getOrganizations({ search: q, sector, stage, limit: PAGE_SIZE + 1, offset }),
    getOrgStages(),
  ])

  const hasNext = orgs.length > PAGE_SIZE
  const rows = orgs.slice(0, PAGE_SIZE)

  const linkParams = (overrides: Record<string, string>) =>
    qs({ q, sector, stage, page: String(page), ...overrides })

  const tagStyle = (active: boolean, color: string): React.CSSProperties => ({
    display: 'inline-block', padding: '6px 12px', borderRadius: 6,
    fontSize: 12, fontWeight: 600, textDecoration: 'none',
    background: active ? color : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#8B9BB4',
    border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
  })

  return (
    <>
      {/* Stage filter tags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stage</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {stages.map(s => (
            <Link key={s} href={linkParams({ stage: s, page: '1' })} style={tagStyle(stage === s, '#4F83CC')}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 13, color: '#4A5568', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{rows.length === 0 ? 'No organizations found' : `Showing ${offset + 1}–${offset + rows.length}${hasNext ? '+' : ''}`}</span>
          {q && <span style={{ color: '#4F83CC' }}>matching &ldquo;{q}&rdquo;</span>}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Name', 'Description', 'People', 'Most Recent Interaction', 'Sector', 'Stage'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#4A5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((org, i) => (
              <tr key={org.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '14px 20px' }}>
                  <Link href={`/organizations/${org.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#D4DBE8' }}>
                    {org.name}
                  </Link>
                  {org.website && (
                    <div>
                      <a href={`https://${org.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#4A5568' }}>
                        {org.website}
                      </a>
                    </div>
                  )}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#8B9BB4' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {org.description}
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <PeopleCell people={org.people_list} />
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <InteractionCell interaction={org.last_interaction} />
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: '#8B9BB4' }}>
                  {org.sectors.slice(0, 2).join(', ') || '—'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: '#8B9BB4' }}>
                  {org.stages.slice(0, 2).join(', ') || '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#4A5568' }}>No organizations found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
