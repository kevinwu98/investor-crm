import { getStats, getMonthlyInteractions, getInteractionTypeBreakdown, getTopOrgs, getRecentInteractions } from '@/lib/queries'
import { StatCard, BarChart, DonutChart, Badge, formatDate, formatCheckSize, TYPE_COLORS, INTERACTION_COLORS } from '@/components/ui'
import Link from 'next/link'

export const revalidate = 60 // refresh every 60 seconds

export default async function DashboardPage() {
  const [stats, monthly, typeBreakdown, topOrgs, recentInteractions] = await Promise.all([
    getStats(),
    getMonthlyInteractions(),
    getInteractionTypeBreakdown(),
    getTopOrgs(5),
    getRecentInteractions(5),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>Dashboard</h1>
        <p style={{ color: '#4A5568', fontSize: 14, marginTop: 4 }}>Capital Network · Overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Organizations" value={stats.total_orgs}
          sub={`+${stats.new_orgs_this_month} this month`} accent="#4F83CC" />
        <StatCard label="Total People" value={stats.total_people} accent="#34A98F" />
        <StatCard label="Total Interactions" value={stats.total_interactions}
          sub={`${stats.interactions_this_month} this month`} accent="#E8834A" />
        <StatCard label="Active LPs" value={stats.lp_count} accent="#9B6FD4" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Interactions Over Time
          </div>
          <BarChart data={monthly} />
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            By Interaction Type
          </div>
          <DonutChart data={typeBreakdown} />
        </div>
      </div>

      {/* Recent Interactions */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Recent Interactions
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {recentInteractions.map((int: any, i: number) => (
              <tr key={int.id} style={{ borderBottom: i < recentInteractions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '12px 24px', width: 100 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    background: `${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}22`,
                    color: INTERACTION_COLORS[int.interaction_type] ?? '#6B7280',
                    border: `1px solid ${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}44`,
                  }}>
                    {int.interaction_type}
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ fontSize: 14, color: '#D4DBE8', fontWeight: 500 }}>{int.title}</div>
                  {int.attendees?.length > 0 && (
                    <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{int.attendees.join(', ')}</div>
                  )}
                </td>
                <td style={{ padding: '12px 24px', textAlign: 'right', fontSize: 12, color: '#4A5568', whiteSpace: 'nowrap' }}>
                  {formatDate(int.interaction_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Orgs */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Top Organizations by Engagement
          </div>
          <Link href="/organizations" style={{ fontSize: 12, color: '#4F83CC' }}>View all →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Organization', 'Type', 'Stage', 'Check Size', 'Interactions'].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, color: '#4A5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topOrgs.map((org: any, i: number) => (
              <tr key={org.id}
                style={{ borderBottom: i < topOrgs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <Link href={`/organizations/${org.id}`}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#D4DBE8' }}>{org.name}</div>
                    <div style={{ fontSize: 12, color: '#4A5568' }}>{org.website}</div>
                  </Link>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  {org.org_type && <Badge label={org.org_type} color={TYPE_COLORS[org.org_type] ?? '#6B7280'} />}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(org.stages ?? []).slice(0, 2).map((s: string) => <Badge key={s} label={s} color="#4F83CC" />)}
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#8B9BB4' }}>
                  {formatCheckSize(org.check_size_min, org.check_size_max)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ height: 6, borderRadius: 3, background: '#4F83CC', width: `${Math.max((org.interaction_count / 20) * 80, 4)}px` }} />
                    <span style={{ fontSize: 13, color: '#8B9BB4' }}>{org.interaction_count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
