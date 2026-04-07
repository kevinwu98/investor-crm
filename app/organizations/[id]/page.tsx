import { getOrgDetail } from '@/lib/queries'
import { Badge, formatDate, formatCheckSize, TYPE_COLORS, INTERACTION_COLORS } from '@/components/ui'
import { PersonCard } from '@/components/PersonCard'
import Link from 'next/link'

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { org, people, interactions } = await getOrgDetail(id)

  if (!org) return (
    <div style={{ color: '#4A5568', padding: 32 }}>Organization not found.</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back */}
      <Link href="/organizations" style={{ fontSize: 13, color: '#4A5568', display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back to Organizations
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>{org.name}</h1>
          <a href={`https://${org.website}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: '#4F83CC' }}>{org.website}</a>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {org.org_type && <Badge label={org.org_type} color={TYPE_COLORS[org.org_type] ?? '#6B7280'} />}
          {org.is_lp && <Badge label="LP" color="#D4A843" />}
          {org.lead_follower && <Badge label={org.lead_follower} color={org.lead_follower === 'Lead' ? '#34A98F' : '#9B6FD4'} />}
        </div>
      </div>

      {/* Profile Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>About</div>
          <p style={{ fontSize: 14, color: '#8B9BB4', lineHeight: 1.7 }}>{org.description || 'No description available.'}</p>
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Investment Profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {org.stages?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6 }}>STAGE</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{org.stages.map((s: string) => <Badge key={s} label={s} color="#4F83CC" />)}</div>
              </div>
            )}
            {org.sectors?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6 }}>SECTORS</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{org.sectors.map((s: string) => <Badge key={s} label={s} color="#E8834A" />)}</div>
              </div>
            )}
            {org.geography?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6 }}>GEOGRAPHY</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{org.geography.map((g: string) => <Badge key={g} label={g} color="#9B6FD4" />)}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6 }}>CHECK SIZE</div>
              <div style={{ fontSize: 14, color: '#D4DBE8', fontWeight: 600 }}>{formatCheckSize(org.check_size_min, org.check_size_max)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* People */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            People ({people.length})
          </div>
        </div>
        {people.length === 0 ? (
          <div style={{ padding: 24, color: '#4A5568', fontSize: 14 }}>No people on record.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {people.map((person: any, i: number) => (
              <div key={person.id} style={{
                padding: '16px 24px',
                borderRight: (i + 1) % 3 !== 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                borderBottom: i < people.length - 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <PersonCard person={person}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#D4DBE8' }}>{person.full_name}</div>
                </PersonCard>
                <div style={{ fontSize: 12, color: '#4A5568', marginTop: 3 }}>{person.headline}</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{person.location}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactions */}
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B9BB4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Interaction History ({interactions.length})
          </div>
        </div>
        {interactions.length === 0 ? (
          <div style={{ padding: 24, color: '#4A5568', fontSize: 14 }}>No interactions on record.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {interactions.map((int: any, i: number) => (
                <tr key={int.id} style={{ borderBottom: i < interactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '12px 24px', width: 100 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: `${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}22`,
                      color: INTERACTION_COLORS[int.interaction_type] ?? '#6B7280',
                      border: `1px solid ${INTERACTION_COLORS[int.interaction_type] ?? '#6B7280'}44`,
                    }}>{int.interaction_type}</span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontSize: 14, color: '#D4DBE8', fontWeight: 500 }}>{int.title}</div>
                    {int.notes && <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{int.notes}</div>}
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontSize: 12, color: '#4A5568', whiteSpace: 'nowrap' }}>
                    {formatDate(int.interaction_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
