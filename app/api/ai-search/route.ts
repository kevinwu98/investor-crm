import OpenAI from 'openai'
import { getOrganizations, getOrgDetail } from '@/lib/queries'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type InternalMatch = {
  id: string
  org_type?: string
  stages: string[]
  sectors: string[]
  people: { id: string; full_name: string; email?: string; headline?: string; location?: string; linkedin_url?: string }[]
  recentInteractions: { id: string; title: string; interaction_type?: string; interaction_date?: string; attendees: string[] }[]
}

export type ExternalFirm = {
  name: string
  website?: string
  description: string
  stages?: string
  sectors?: string
  internalMatch?: InternalMatch
}

// ── Internal: semantic match against all org summaries ────────────────────────

async function matchInternalOrgs(
  query: string,
  orgs: Awaited<ReturnType<typeof getOrganizations>>,
): Promise<{ ids: string[]; explanation: string }> {
  // Build compact summaries — keep descriptions short to manage context size
  const summaries = orgs
    .filter(o => o.name)
    .map(o =>
      `[${o.id}] ${o.name} | ${o.org_type ?? ''} | ${o.stages.join(', ')} | ${o.sectors.join(', ')} | ${(o.description ?? '').slice(0, 120)}`
    )
    .join('\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are searching an investor CRM database. Given a list of organizations, identify which ones match the user's query.

Be inclusive — match on any relevant signal: org type, stages, sectors, description content, or name. Return up to 15 best matches.

Return JSON: { "ids": ["id1", "id2", ...], "explanation": "one sentence describing the search" }`,
      },
      {
        role: 'user',
        content: `Query: "${query}"\n\nOrganizations:\n${summaries}`,
      },
    ],
  })

  return JSON.parse(completion.choices[0].message.content ?? '{"ids":[],"explanation":""}')
}

// ── External: web search for specific firm names ───────────────────────────────

async function searchWebFirms(query: string, internalNames: string[]): Promise<ExternalFirm[]> {
  const exclude = internalNames.length > 0
    ? `Do not include these firms (already in the database): ${internalNames.slice(0, 20).join(', ')}.`
    : ''

  let rawText: string | null = null

  // Try Responses API with web search
  try {
    // @ts-ignore - responses typings vary by SDK version
    const res = await openai.responses.create({
      model: 'gpt-4o-mini',
      tools: [{ type: 'web_search_preview' }],
      input: `Find 8 specific investment firms that match this description: "${query}". ${exclude} For each firm include: name, website, one-sentence description, typical investment stages, and sectors.`,
    })
    // @ts-expect-error
    rawText = res.output_text ?? null
  } catch {
    // Fallback: use model knowledge (no live web)
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `List 8 specific investment firms that match: "${query}". ${exclude} For each include: name, website, one-sentence description, typical investment stages, sectors.`,
          },
        ],
      })
      rawText = res.choices[0].message.content
    } catch {
      return []
    }
  }

  if (!rawText) return []

  // Parse the free-text response into structured firm objects
  try {
    const parse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Extract investment firm details from the text into structured JSON. Return: { "firms": [{ "name": string, "website": string, "description": string, "stages": string, "sectors": string }] }. Use empty string if a field is missing.',
        },
        { role: 'user', content: rawText },
      ],
    })
    const { firms } = JSON.parse(parse.choices[0].message.content ?? '{}')
    return (firms ?? []) as ExternalFirm[]
  } catch {
    return []
  }
}

// ── Name matching: normalize + fuzzy-match external firm names ────────────────

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(llc|lp|inc|fund|ventures|venture|capital|partners|investments|investment|management|group|advisors|advisory|holdings|equity|asset|assets)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function findOrgMatch(
  firmName: string,
  orgs: Awaited<ReturnType<typeof getOrganizations>>,
): Awaited<ReturnType<typeof getOrganizations>>[number] | null {
  const normalized = normalizeName(firmName)
  return orgs.find(o => normalizeName(o.name) === normalized) ?? null
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { query } = await req.json()
  if (!query?.trim()) {
    return Response.json({ error: 'No query provided' }, { status: 400 })
  }

  // Fetch all orgs up front (cached), then run both searches in parallel
  const allOrgs = await getOrganizations({ limit: 2000 })

  const [matchResult, externalFirms] = await Promise.all([
    matchInternalOrgs(query, allOrgs),
    searchWebFirms(query, allOrgs.map(o => o.name)),
  ])

  // Look up full org data (people + interactions) for each matched ID
  const matchedOrgs = matchResult.ids
    .map(id => allOrgs.find(o => o.id === id))
    .filter(Boolean) as typeof allOrgs

  const enriched = await Promise.all(
    matchedOrgs.map(async org => {
      const { interactions } = await getOrgDetail(org.id)
      return {
        id: org.id,
        name: org.name,
        website: org.website,
        description: org.description,
        org_type: org.org_type,
        stages: org.stages,
        sectors: org.sectors,
        people: org.people_list,
        recentInteractions: interactions.slice(0, 3),
      }
    })
  )

  // Enrich external firms with internal data if names match
  const enrichedExternal = await Promise.all(
    externalFirms.map(async firm => {
      const match = findOrgMatch(firm.name, allOrgs)
      if (!match) return firm
      const { interactions } = await getOrgDetail(match.id)
      return {
        ...firm,
        internalMatch: {
          id: match.id,
          org_type: match.org_type,
          stages: match.stages,
          sectors: match.sectors,
          people: match.people_list,
          recentInteractions: interactions.slice(0, 3),
        } satisfies InternalMatch,
      }
    })
  )

  return Response.json({
    internalResults: enriched,
    externalFirms: enrichedExternal,
    explanation: matchResult.explanation,
  })
}
