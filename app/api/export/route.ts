import { getOrganizations } from '@/lib/queries'

function csv(val: string | undefined): string {
  const s = val ?? ''
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q')      ?? ''
  const sector = searchParams.get('sector') ?? 'All'
  const stage  = searchParams.get('stage')  ?? 'All'

  const orgs = await getOrganizations({ search: q, sector, stage, limit: 10_000 })

  const rows = ['Organization Name,Contact Name,Contact Email']

  for (const org of orgs) {
    if (org.people_list.length === 0) {
      rows.push(`${csv(org.name)},,`)
    } else {
      for (const p of org.people_list) {
        rows.push(`${csv(org.name)},${csv(p.full_name)},${csv(p.email)}`)
      }
    }
  }

  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="contacts.csv"`,
    },
  })
}
