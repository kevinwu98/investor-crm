'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Person, Interaction } from '@/lib/queries'
import { INTERACTION_COLORS } from '@/components/ui'
import { SearchExportButton } from '@/components/ExportButton'

type InternalMatch = {
  id: string
  org_type?: string
  stages: string[]
  sectors: string[]
  people: Person[]
  recentInteractions: { id: string; title: string; interaction_type?: string; interaction_date?: string; attendees: string[] }[]
}

type ExternalFirm = {
  name: string
  website?: string
  description: string
  stages?: string
  sectors?: string
  internalMatch?: InternalMatch
}

type OrgResult = {
  id: string
  name: string
  website?: string
  description?: string
  org_type?: string
  stages: string[]
  sectors: string[]
  people: Person[]
  recentInteractions: Interaction[]
}

type SearchResponse = {
  internalResults: OrgResult[]
  externalFirms: ExternalFirm[]
  explanation: string
}

const EXAMPLE_QUERIES = [
  'Series A investors focused on Fintech',
  'Family offices on the East Coast',
  'Early stage VCs in Consumer and Enterprise',
  'Growth equity funds that lead rounds',
]

const TAG_GROUPS = [
  {
    label: 'Stage',
    color: '#4F83CC',
    tags: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'Late Stage'],
  },
  {
    label: 'Sector',
    color: '#E8834A',
    tags: ['Consumer', 'Enterprise', 'Fintech', 'Games', 'Healthcare', 'Defense Tech', 'AI/ML', 'SaaS'],
  },
  {
    label: 'Geography',
    color: '#9B6FD4',
    tags: ['US', 'East Coast', 'West Coast', 'Europe', 'Asia', 'Global'],
  },
  {
    label: 'Type',
    color: '#34A98F',
    tags: ['VC', 'PE', 'Family Office', 'CVC', 'Angel', 'Accelerator'],
  },
]

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{label}</span>
  )
}

function OrgCard({ org }: { org: OrgResult }) {
  const [showAllPeople, setShowAllPeople] = useState(false)
  const visiblePeople = showAllPeople ? org.people : org.people.slice(0, 4)

  return (
    <div style={{
      background: '#111827', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Org header */}
      <div style={{ padding: '18px 24px 14px', borderBottom: org.people.length > 0 || org.recentInteractions.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <div>
            <Link href={`/organizations/${org.id}`} style={{ fontSize: 16, fontWeight: 700, color: '#F0F4FF', textDecoration: 'none' }}>
              {org.name}
            </Link>
            {org.website && (
              <a href={`https://${org.website}`} target="_blank" rel="noreferrer"
                style={{ display: 'block', fontSize: 11, color: '#4A5568', marginTop: 2 }}>
                {org.website}
              </a>
            )}
          </div>
          {org.org_type && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
              background: 'rgba(52,169,143,0.15)', color: '#7FD4C0', border: '1px solid rgba(52,169,143,0.3)',
            }}>{org.org_type}</span>
          )}
        </div>

        {org.description && (
          <p style={{ fontSize: 13, color: '#8B9BB4', lineHeight: 1.6, margin: '0 0 10px' }}>
            {org.description.length > 220 ? org.description.slice(0, 220) + '…' : org.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {org.stages.map(s => <Pill key={s} label={s} color="#4F83CC" />)}
          {org.sectors.slice(0, 4).map(s => <Pill key={s} label={s} color="#E8834A" />)}
        </div>
      </div>

      {/* People */}
      {org.people.length > 0 && (
        <div style={{ padding: '12px 24px', borderBottom: org.recentInteractions.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            People · {org.people.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {visiblePeople.map(p => (
              <div key={p.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '6px 12px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#D4DBE8' }}>{p.full_name}</div>
                {p.headline && <div style={{ fontSize: 11, color: '#4A5568', marginTop: 1 }}>{p.headline}</div>}
                {p.email && (
                  <a href={`mailto:${p.email}`} style={{ fontSize: 11, color: '#4F83CC', display: 'block', marginTop: 1 }}>{p.email}</a>
                )}
              </div>
            ))}
            {!showAllPeople && org.people.length > 4 && (
              <button onClick={() => setShowAllPeople(true)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '6px 12px', color: '#4F83CC', fontSize: 12,
                cursor: 'pointer', alignSelf: 'center',
              }}>
                +{org.people.length - 4} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Interactions */}
      {org.recentInteractions.length > 0 && (
        <div style={{ padding: '12px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Recent Interactions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {org.recentInteractions.map(int => {
              const color = INTERACTION_COLORS[int.interaction_type ?? ''] ?? '#6B7280'
              return (
                <div key={int.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {int.interaction_type && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 3, flexShrink: 0,
                      background: `${color}22`, color, border: `1px solid ${color}44`,
                    }}>{int.interaction_type}</span>
                  )}
                  <span style={{ fontSize: 13, color: '#8B9BB4' }}>{int.title}</span>
                  {int.interaction_date && (
                    <span style={{ fontSize: 11, color: '#4A5568', marginLeft: 'auto', flexShrink: 0 }}>
                      {new Date(int.interaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  const shimmer: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', borderRadius: 4 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ ...shimmer, height: 16, width: '35%' }} />
            <div style={{ ...shimmer, height: 22, width: 80, borderRadius: 20 }} />
          </div>
          <div style={{ ...shimmer, height: 13, width: '90%' }} />
          <div style={{ ...shimmer, height: 13, width: '70%' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[55, 70, 65].map((w, j) => <div key={j} style={{ ...shimmer, height: 20, width: w }} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ label, count, accent = '#4A5568' }: { label: string; count: number; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#374151', background: 'rgba(255,255,255,0.05)', padding: '1px 8px', borderRadius: 10 }}>{count}</span>
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function runSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      if (!res.ok) throw new Error('Search failed')
      setResponse(await res.json())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(query)
  }

  function useExample(q: string) {
    setQuery(q)
    runSearch(q)
  }

  // Tags use the query string as source of truth.
  // A tag is "active" if its label appears in the current query (case-insensitive).
  function isTagActive(tag: string) {
    return query.toLowerCase().includes(tag.toLowerCase())
  }

  function toggleTag(tag: string) {
    if (isTagActive(tag)) {
      // Remove the tag text from the query
      const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      setQuery(prev => prev.replace(new RegExp(escaped, 'gi'), '').replace(/\s{2,}/g, ' ').trim())
    } else {
      // Append the tag to the query
      setQuery(prev => prev.trim() ? `${prev.trim()} ${tag}` : tag)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F0F4FF', fontFamily: 'Georgia, serif' }}>AI-Powered Search</h1>
        <p style={{ color: '#4A5568', fontSize: 14, marginTop: 4 }}>
          Describe what you&apos;re looking for — searches your network and the web
        </p>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='e.g. "Series A VCs focused on Fintech" or "Family offices on the East Coast"'
          style={{
            flex: 1,
            background: '#111827', border: '1px solid rgba(79,131,204,0.4)',
            borderRadius: 10, padding: '14px 18px',
            color: '#F0F4FF', fontSize: 15, outline: 'none',
          }}
        />
        <button type="submit" disabled={loading || !query.trim()} style={{
          padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: loading || !query.trim() ? 'rgba(79,131,204,0.4)' : '#4F83CC',
          color: '#fff', border: 'none', cursor: loading || !query.trim() ? 'default' : 'pointer',
          flexShrink: 0,
        }}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Examples + tag builder */}
      {!response && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Example queries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Try an example
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EXAMPLE_QUERIES.map(q => (
                <button key={q} onClick={() => useExample(q)} style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', color: '#8B9BB4',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>{q}</button>
              ))}
            </div>
          </div>

          {/* Tag builder */}
          <div style={{
            background: '#111827', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Build your search
            </div>
            {TAG_GROUPS.map(group => (
              <div key={group.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase',
                  letterSpacing: '0.06em', paddingTop: 7, width: 72, flexShrink: 0,
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {group.tags.map(tag => {
                    const active = isTagActive(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                          fontWeight: active ? 600 : 400,
                          background: active ? `${group.color}22` : 'rgba(255,255,255,0.04)',
                          color: active ? group.color : '#6B7A94',
                          border: active ? `1px solid ${group.color}66` : '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.12s',
                        }}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {loading && <LoadingSkeleton />}

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 14 }}>
          {error}
        </div>
      )}

      {response && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* AI interpretation */}
          <div style={{
            background: 'rgba(79,131,204,0.08)', border: '1px solid rgba(79,131,204,0.2)',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 14, color: '#A8C4E8' }}>{response.explanation}</div>
          </div>

          {/* Your network */}
          <div>
            <SectionHeader label="From your network" count={response.internalResults.length} />
            {response.internalResults.length === 0 ? (
              <div style={{ padding: '28px 24px', textAlign: 'center', color: '#4A5568', background: '#111827', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', fontSize: 14 }}>
                No matching organizations found in your network.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {response.internalResults.map(org => <OrgCard key={org.id} org={org} />)}
              </div>
            )}
          </div>

          {/* From the web */}
          {response.externalFirms.length > 0 && (
            <div>
              <SectionHeader label="From the web" count={response.externalFirms.length} accent="#9B6FD4" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {response.externalFirms.map((firm, i) => {
                  // If matched to an internal org, render as a full OrgCard
                  if (firm.internalMatch) {
                    const m = firm.internalMatch
                    const org: OrgResult = {
                      id: m.id,
                      name: firm.name,
                      website: firm.website,
                      description: firm.description,
                      org_type: m.org_type,
                      stages: m.stages,
                      sectors: m.sectors,
                      people: m.people,
                      recentInteractions: m.recentInteractions as OrgResult['recentInteractions'],
                    }
                    return (
                      <div key={i} style={{ position: 'relative' }}>
                        <OrgCard org={org} />
                        <span style={{
                          position: 'absolute', top: 16, right: 16,
                          fontSize: 10, padding: '2px 8px', borderRadius: 4,
                          background: 'rgba(155,111,212,0.15)', color: '#C4A8E8',
                          border: '1px solid rgba(155,111,212,0.3)', pointerEvents: 'none',
                        }}>Web</span>
                      </div>
                    )
                  }

                  // Otherwise render as a simple web card
                  return (
                    <div key={i} style={{
                      background: '#111827', border: '1px solid rgba(155,111,212,0.15)',
                      borderRadius: 12, padding: '16px 20px',
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#F0F4FF' }}>{firm.name}</div>
                          {firm.website && (
                            <a href={firm.website.startsWith('http') ? firm.website : `https://${firm.website}`}
                              target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, color: '#4A5568' }}>{firm.website}</a>
                          )}
                        </div>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                          background: 'rgba(155,111,212,0.15)', color: '#C4A8E8', border: '1px solid rgba(155,111,212,0.3)',
                        }}>Web</span>
                      </div>
                      {firm.description && (
                        <p style={{ fontSize: 13, color: '#8B9BB4', lineHeight: 1.6, margin: 0 }}>{firm.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                        {firm.stages && firm.stages.split(/[,·|]/).map(s => s.trim()).filter(Boolean).map(s => (
                          <Pill key={s} label={s} color="#4F83CC" />
                        ))}
                        {firm.sectors && firm.sectors.split(/[,·|]/).map(s => s.trim()).filter(Boolean).map(s => (
                          <Pill key={s} label={s} color="#E8834A" />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setResponse(null); setQuery('') }} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              background: 'rgba(255,255,255,0.05)', color: '#8B9BB4',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            }}>
              ← New search
            </button>
            {(response.internalResults.length > 0 || response.externalFirms.length > 0) && (
              <SearchExportButton
                results={[
                  ...response.internalResults,
                  ...response.externalFirms.map(f => ({
                    name: f.name,
                    people: f.internalMatch?.people ?? [],
                  })),
                ]}
                filename="search-contacts.csv"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
