'use client'

type Row = { org: string; name: string; email: string }

function escapeCSV(val: string | undefined): string {
  const s = val ?? ''
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function downloadCSV(rows: Row[], filename: string) {
  const lines = [
    'Organization Name,Contact Name,Contact Email',
    ...rows.map(r => `${escapeCSV(r.org)},${escapeCSV(r.name)},${escapeCSV(r.email)}`),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Variant A: fetches from the server (Organizations page) ───────────────────

export function OrgExportButton({ q, sector, stage }: { q: string; sector: string; stage: string }) {
  function handleExport() {
    const params = new URLSearchParams({ q, sector, stage })
    // Use a direct navigation so the browser handles the Content-Disposition download
    window.location.href = `/api/export?${params}`
  }

  return (
    <button onClick={handleExport} style={btnStyle}>
      Export CSV
    </button>
  )
}

// ── Variant B: generates CSV from already-fetched client data (Search page) ───

type SearchOrg = {
  name: string
  people: { full_name: string; email?: string }[]
}

export function SearchExportButton({ results, filename = 'search-contacts.csv' }: { results: SearchOrg[]; filename?: string }) {
  function handleExport() {
    const rows: Row[] = []
    for (const org of results) {
      if (org.people.length === 0) {
        rows.push({ org: org.name, name: '', email: '' })
      } else {
        for (const p of org.people) {
          rows.push({ org: org.name, name: p.full_name, email: p.email ?? '' })
        }
      }
    }
    downloadCSV(rows, filename)
  }

  return (
    <button onClick={handleExport} style={btnStyle}>
      Export CSV
    </button>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  background: 'rgba(255,255,255,0.06)', color: '#8B9BB4',
  border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
}
