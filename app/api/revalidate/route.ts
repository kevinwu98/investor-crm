import { revalidateTag } from 'next/cache'
import { AIRTABLE_TAG } from '@/lib/airtable'

// POST /api/revalidate?secret=...
// Trigger this nightly (Zapier schedule, cron, or manual) to refresh all
// Airtable-backed data on demand instead of waiting for the 24h cache window.
export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  revalidateTag(AIRTABLE_TAG)
  return Response.json({ ok: true, revalidated: AIRTABLE_TAG, at: new Date().toISOString() })
}
