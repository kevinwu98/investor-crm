import Link from 'next/link'
import { getPeople } from '@/lib/queries'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const people = await getPeople({ search: q })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>People</h1>
        <p style={{ color: '#4A5568', fontSize: 14, marginTop: 4 }}>{people.length} people</p>
      </div>

      <form style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or organization..."
          style={{
            flex: 1, background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 16px', color: '#F0F4FF', fontSize: 14, outline: 'none',
          }}
        />
        <button type="submit" style={{
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: '#4F83CC', color: '#fff', border: 'none', cursor: 'pointer',
        }}>Search</button>
      </form>

      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Name', 'Email', 'Organization', 'Location', 'LinkedIn'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#4A5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < people.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#D4DBE8' }}>{p.full_name}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#8B9BB4' }}>{p.email}</td>
                <td style={{ padding: '14px 20px', fontSize: 13 }}>
                  {p.organization_id && p.organization_name ? (
                    <Link href={`/organizations/${p.organization_id}`} style={{ color: '#4F83CC' }}>
                      {p.organization_name}
                    </Link>
                  ) : <span style={{ color: '#4A5568' }}>—</span>}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#8B9BB4' }}>{p.location ?? '—'}</td>
                <td style={{ padding: '14px 20px', fontSize: 13 }}>
                  {p.linkedin_url && (
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#4F83CC' }}>View</a>
                  )}
                </td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#4A5568' }}>No people found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
