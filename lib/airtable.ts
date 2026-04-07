import 'server-only'

const BASE = process.env.AIRTABLE_BASE_ID!
const TOKEN = process.env.AIRTABLE_TOKEN!

// Cache all Airtable data for 24h, taggable for on-demand revalidation.
const REVALIDATE = 60 * 60 * 24
const TAG = 'airtable'

export type AirtableRecord<T = Record<string, any>> = {
  id: string
  createdTime: string
  fields: T
}

type ListResponse<T> = {
  records: AirtableRecord<T>[]
  offset?: string
}

/**
 * Fetch ALL records from a table, transparently paginating.
 * Server-only. Cached for 24h with the 'airtable' tag.
 */
export async function airtableAll<T = Record<string, any>>(
  table: string
): Promise<AirtableRecord<T>[]> {
  if (!BASE || !TOKEN) {
    throw new Error('Missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN env var')
  }

  const all: AirtableRecord<T>[] = []
  let offset: string | undefined = undefined

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) params.set('offset', offset)

    const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?${params}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE, tags: [TAG] },
    })
    if (!res.ok) {
      throw new Error(`Airtable ${table} ${res.status}: ${await res.text()}`)
    }
    const json = (await res.json()) as ListResponse<T>
    all.push(...json.records)
    offset = json.offset
  } while (offset)

  return all
}

export const AIRTABLE_TAG = TAG
