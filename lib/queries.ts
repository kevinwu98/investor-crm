import 'server-only'
import { airtableAll, AirtableRecord } from './airtable'

// ── Table names (as they appear in Airtable) ──────────────────────────────────

const TBL_ORGS = 'Organizations'
const TBL_PEOPLE = 'People'
const TBL_INTERACTIONS = 'Interactions'

// ── Raw Airtable field shapes (loose — Airtable returns whatever you give it) ─

type OrgFields = {
  Name?: string
  'Website (For Lookup)'?: string | string[]
  'Website (Raw Input)'?: string
  Description?: string
  'Investor Type'?: string | string[]
  'Lead or Follower'?: string | string[]
  'Investing Stage'?: string | string[]
  Sector?: string | string[]
  'Sub-Sectors'?: string | string[]
  'Preferred Geography'?: string | string[]
  'Min Check'?: number
  'Max Check'?: number
  LP?: boolean
  Created?: string
  'Last Modified Time'?: string
}

type PersonFields = {
  'Full Name'?: string
  'Primary Email'?: string
  'ARGO Headline'?: string
  LinkedIn?: string
  'Location (City)'?: string
  'Location (State)'?: string
  'Location (Country)'?: string
  'Current Organization ID'?: string[] // linked record IDs
  'Organization Name (from Current Organization ID)'?: string[]
  Interactions?: string[] // linked record IDs
}

type InteractionFields = {
  Name?: string
  Type?: string
  Date?: string
  'Full Name (from Individuals)'?: string[]
  // Despite the name, this field stores linked People record IDs.
  'Attendee Emails'?: string[]
  'Current Organization (from Attendee Emails)'?: string[]
}

// ── Normalized UI-facing shapes (match what components expect) ────────────────

export type Org = {
  id: string
  name: string
  website?: string
  description?: string
  org_type?: string
  lead_follower?: string
  stages: string[]
  sectors: string[]
  geography: string[]
  check_size_min?: number
  check_size_max?: number
  is_lp: boolean
  created_at?: string
  interaction_count: number
  people_count: number
  people_list: Person[]
  last_interaction_date?: string
  last_interaction?: Interaction
}

export type Person = {
  id: string
  full_name: string
  email?: string
  headline?: string
  location?: string
  linkedin_url?: string
  organization_id?: string
}

export type Interaction = {
  id: string
  title: string
  interaction_type?: string
  interaction_date?: string
  notes?: string
  created_by?: string
  attendees: string[]
  person_ids: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function arr(v: string | string[] | undefined): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v
  // Airtable can return comma-joined in some exports; be defensive.
  return String(v).split(',').map(s => s.trim()).filter(Boolean)
}

function first(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined
  if (Array.isArray(v)) return v[0]
  return v
}

function normalizeOrg(rec: AirtableRecord<OrgFields>): Org {
  const f = rec.fields
  return {
    id: rec.id,
    name: f.Name ?? '',
    website: first(f['Website (For Lookup)']) ?? f['Website (Raw Input)'],
    description: f.Description,
    org_type: first(f['Investor Type']),
    lead_follower: first(f['Lead or Follower']),
    stages: arr(f['Investing Stage']),
    sectors: [...arr(f.Sector), ...arr(f['Sub-Sectors'])],
    geography: arr(f['Preferred Geography']),
    check_size_min: f['Min Check'],
    check_size_max: f['Max Check'],
    is_lp: !!f.LP,
    created_at: f.Created ?? rec.createdTime,
    interaction_count: 0,
    people_count: 0,
  }
}

function normalizePerson(rec: AirtableRecord<PersonFields>): Person {
  const f = rec.fields
  const locParts = [f['Location (City)'], f['Location (State)'], f['Location (Country)']].filter(Boolean)
  return {
    id: rec.id,
    full_name: f['Full Name'] ?? '(Unnamed)',
    email: f['Primary Email'],
    headline: f['ARGO Headline'],
    location: locParts.join(', ') || undefined,
    linkedin_url: f.LinkedIn,
    organization_id: f['Current Organization ID']?.[0],
  }
}

function normalizeInteraction(rec: AirtableRecord<InteractionFields>): Interaction {
  const f = rec.fields
  return {
    id: rec.id,
    title: f.Name ?? '(Untitled)',
    interaction_type: f.Type,
    interaction_date: f.Date,
    notes: undefined,
    created_by: undefined,
    attendees: f['Full Name (from Individuals)'] ?? [],
    // "Attendee Emails" is actually the linked People field (record IDs).
    person_ids: f['Attendee Emails'] ?? [],
  }
}

// ── Cached fetchers (each hits Airtable once per revalidate window) ───────────

async function allOrgsRaw(): Promise<Org[]> {
  const recs = await airtableAll<OrgFields>(TBL_ORGS)
  return recs.map(normalizeOrg)
}

async function allPeople(): Promise<Person[]> {
  const recs = await airtableAll<PersonFields>(TBL_PEOPLE)
  return recs.map(normalizePerson)
}

async function allInteractions(): Promise<Interaction[]> {
  const recs = await airtableAll<InteractionFields>(TBL_INTERACTIONS)
  return recs.map(normalizeInteraction)
}

/**
 * Organizations enriched with real people_count and interaction_count,
 * computed via in-memory join across all three tables.
 */
async function allOrgs(): Promise<Org[]> {
  const [orgs, people, interactions] = await Promise.all([
    allOrgsRaw(), allPeople(), allInteractions(),
  ])

  // People per org
  const peopleByOrg = new Map<string, number>()
  const peopleListByOrg = new Map<string, Person[]>()
  const orgByPerson = new Map<string, string>()
  for (const p of people) {
    if (!p.organization_id) continue
    peopleByOrg.set(p.organization_id, (peopleByOrg.get(p.organization_id) ?? 0) + 1)
    orgByPerson.set(p.id, p.organization_id)
    const list = peopleListByOrg.get(p.organization_id) ?? []
    list.push(p)
    peopleListByOrg.set(p.organization_id, list)
  }

  // Interactions per org (attribute by any attendee's current org)
  const interactionsByOrg = new Map<string, number>()
  const lastInteractionByOrg = new Map<string, Interaction>()
  for (const i of interactions) {
    const seen = new Set<string>()
    for (const pid of i.person_ids) {
      const orgId = orgByPerson.get(pid)
      if (orgId && !seen.has(orgId)) {
        seen.add(orgId)
        interactionsByOrg.set(orgId, (interactionsByOrg.get(orgId) ?? 0) + 1)
        if (i.interaction_date) {
          const prev = lastInteractionByOrg.get(orgId)
          if (!prev || i.interaction_date > (prev.interaction_date ?? '')) {
            lastInteractionByOrg.set(orgId, i)
          }
        }
      }
    }
  }

  return orgs.map(o => {
    const last = lastInteractionByOrg.get(o.id)
    return {
      ...o,
      people_count: peopleByOrg.get(o.id) ?? 0,
      people_list: peopleListByOrg.get(o.id) ?? [],
      interaction_count: interactionsByOrg.get(o.id) ?? 0,
      last_interaction_date: last?.interaction_date,
      last_interaction: last,
    }
  })
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [orgs, people, interactions] = await Promise.all([
    allOrgs(),
    allPeople(),
    allInteractions(),
  ])

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const interactionsThisMonth = interactions.filter(i => {
    if (!i.interaction_date) return false
    return new Date(i.interaction_date) >= startOfMonth
  }).length

  const newOrgsThisMonth = orgs.filter(o => {
    if (!o.created_at) return false
    return new Date(o.created_at) >= startOfMonth
  }).length

  const lpCount = orgs.filter(o => o.is_lp).length

  return {
    total_orgs: orgs.length,
    total_people: people.length,
    total_interactions: interactions.length,
    interactions_this_month: interactionsThisMonth,
    new_orgs_this_month: newOrgsThisMonth,
    lp_count: lpCount,
  }
}

// ── Monthly interactions (last 7 months) ──────────────────────────────────────

export async function getMonthlyInteractions() {
  const interactions = await allInteractions()
  const buckets: { month: string; start: Date; end: Date; interactions: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    buckets.push({
      month: start.toLocaleString('default', { month: 'short' }),
      start, end, interactions: 0,
    })
  }

  for (const int of interactions) {
    if (!int.interaction_date) continue
    const t = new Date(int.interaction_date).getTime()
    for (const b of buckets) {
      if (t >= b.start.getTime() && t <= b.end.getTime()) {
        b.interactions++
        break
      }
    }
  }

  return buckets.map(b => ({ month: b.month, interactions: b.interactions }))
}

// ── Interaction type breakdown ────────────────────────────────────────────────

export async function getInteractionTypeBreakdown() {
  const colors: Record<string, string> = {
    Meeting: '#4F83CC', Intro: '#34A98F', Outreach: '#E8834A',
    'Follow-up': '#9B6FD4', Other: '#6B7280',
  }
  const interactions = await allInteractions()
  const counts = new Map<string, number>()
  for (const i of interactions) {
    const t = i.interaction_type ?? 'Other'
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .filter(([, c]) => c > 0)
    .map(([type, count]) => ({ type, count, color: colors[type] ?? '#6B7280' }))
}

// ── Top orgs by engagement ────────────────────────────────────────────────────

export async function getTopOrgs(limit = 10): Promise<Org[]> {
  const orgs = await allOrgs()
  return [...orgs]
    .sort((a, b) => b.interaction_count - a.interaction_count)
    .slice(0, limit)
}

// ── Organizations list (searchable, filterable) ───────────────────────────────

export async function getOrganizations({
  search = '',
  sector = '',
  stage = '',
  limit = 1000,
  offset = 0,
}: {
  search?: string
  sector?: string
  stage?: string
  limit?: number
  offset?: number
} = {}): Promise<Org[]> {
  let orgs = await allOrgs()

  // Drop records with no Name (Airtable has many empty rows).
  orgs = orgs.filter(o => o.name)

  if (search) {
    const q = search.toLowerCase()
    orgs = orgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      (o.website ?? '').toLowerCase().includes(q)
    )
  }
  if (sector && sector !== 'All') {
    orgs = orgs.filter(o => o.sectors.includes(sector))
  }
  if (stage && stage !== 'All') {
    orgs = orgs.filter(o => o.stages.includes(stage))
  }

  orgs.sort((a, b) => {
    const ta = a.last_interaction_date ? new Date(a.last_interaction_date).getTime() : 0
    const tb = b.last_interaction_date ? new Date(b.last_interaction_date).getTime() : 0
    return tb - ta
  })
  return orgs.slice(offset, offset + limit)
}

// ── Org detail (org + people + interactions) ──────────────────────────────────

export async function getOrgDetail(orgId: string) {
  const [orgs, people, interactions] = await Promise.all([
    allOrgs(),
    allPeople(),
    allInteractions(),
  ])

  const org = orgs.find(o => o.id === orgId) ?? null
  if (!org) return { org: null, people: [], interactions: [] }

  // People at this org (via People.Current Organization ID linked field)
  const orgPeople = people.filter(p => p.organization_id === orgId)

  // Interactions that include any of these people as an attendee
  const personIdSet = new Set(orgPeople.map(p => p.id))
  const orgInteractions = interactions
    .filter(i => i.person_ids.some(pid => personIdSet.has(pid)))
    .sort((a, b) => {
      const ta = a.interaction_date ? new Date(a.interaction_date).getTime() : 0
      const tb = b.interaction_date ? new Date(b.interaction_date).getTime() : 0
      return tb - ta
    })

  return { org, people: orgPeople, interactions: orgInteractions }
}

// ── Recent interactions (dashboard) ───────────────────────────────────────────

export async function getRecentInteractions(limit = 5) {
  const interactions = await allInteractions()
  return [...interactions]
    .sort((a, b) => {
      const ta = a.interaction_date ? new Date(a.interaction_date).getTime() : 0
      const tb = b.interaction_date ? new Date(b.interaction_date).getTime() : 0
      return tb - ta
    })
    .slice(0, limit)
}

// ── Distinct org types for filter UI ──────────────────────────────────────────

export async function getOrgSectors(): Promise<string[]> {
  const orgs = await allOrgs()
  const set = new Set<string>()
  for (const o of orgs) for (const s of o.sectors) set.add(s)
  return ['All', ...Array.from(set).sort()]
}

export async function getOrgStages(): Promise<string[]> {
  const orgs = await allOrgs()
  const set = new Set<string>()
  for (const o of orgs) for (const s of o.stages) set.add(s)
  return ['All', ...Array.from(set).sort()]
}

// ── People list (with org name) ───────────────────────────────────────────────

export type PersonRow = Person & { organization_name?: string }

export async function getPeople({
  search = '',
  limit = 1000,
  offset = 0,
}: { search?: string; limit?: number; offset?: number } = {}): Promise<PersonRow[]> {
  const [people, orgs] = await Promise.all([allPeople(), allOrgs()])
  const orgName = new Map(orgs.map(o => [o.id, o.name]))

  let rows: PersonRow[] = people
    .filter(p => p.full_name)
    .map(p => ({
      ...p,
      organization_name: p.organization_id ? orgName.get(p.organization_id) : undefined,
    }))

  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q) ||
      (p.organization_name ?? '').toLowerCase().includes(q)
    )
  }

  rows.sort((a, b) => a.full_name.localeCompare(b.full_name))
  return rows.slice(offset, offset + limit)
}

// ── Interactions list (with org names) ────────────────────────────────────────

export type OrgSummary = {
  id: string
  name: string
  website?: string
  description?: string
  sectors: string[]
  stages: string[]
}

export type InteractionRow = Interaction & {
  organization_names: string[]
  people_list: Person[]
  orgs_list: OrgSummary[]
}

export async function getInteractions({
  search = '',
  type = '',
  limit = 1000,
  offset = 0,
}: { search?: string; type?: string; limit?: number; offset?: number } = {}): Promise<InteractionRow[]> {
  const [interactions, people, orgs] = await Promise.all([
    allInteractions(), allPeople(), allOrgs(),
  ])

  const orgById = new Map(orgs.map(o => [o.id, o]))
  const personById = new Map(people.map(p => [p.id, p]))
  const orgByPerson = new Map<string, string>()
  for (const p of people) if (p.organization_id) orgByPerson.set(p.id, p.organization_id)

  let rows: InteractionRow[] = interactions.map(i => {
    const orgIds = new Set<string>()
    const people_list: Person[] = []
    for (const pid of i.person_ids) {
      const person = personById.get(pid)
      if (person) people_list.push(person)
      const oid = orgByPerson.get(pid)
      if (oid) orgIds.add(oid)
    }
    const orgs_list: OrgSummary[] = Array.from(orgIds).map(id => {
      const o = orgById.get(id)!
      return { id: o.id, name: o.name, website: o.website, description: o.description, sectors: o.sectors, stages: o.stages }
    })
    return {
      ...i,
      organization_names: orgs_list.map(o => o.name),
      people_list,
      orgs_list,
    }
  })

  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.attendees.some(a => a.toLowerCase().includes(q)) ||
      i.organization_names.some(n => n.toLowerCase().includes(q))
    )
  }
  if (type && type !== 'All') {
    rows = rows.filter(i => i.interaction_type === type)
  }

  rows.sort((a, b) => {
    const ta = a.interaction_date ? new Date(a.interaction_date).getTime() : 0
    const tb = b.interaction_date ? new Date(b.interaction_date).getTime() : 0
    return tb - ta
  })
  return rows.slice(offset, offset + limit)
}

export async function getInteractionTypes(): Promise<string[]> {
  const interactions = await allInteractions()
  const set = new Set<string>()
  for (const i of interactions) if (i.interaction_type) set.add(i.interaction_type)
  return ['All', ...Array.from(set).sort()]
}
