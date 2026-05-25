import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { getCookHistory, getPits } from '@/lib/supabase/account'
import { CooksHistory } from '@/components/account/CooksHistory'
import type { CookHistoryRow } from '@/types/account'

export default async function CooksPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cooks, hasMore }, pits] = await Promise.all([
    getCookHistory(user.id),
    getPits(user.id),
  ])

  async function loadMore(page: number): Promise<{ data: CookHistoryRow[]; hasMore: boolean }> {
    'use server'
    return getCookHistory(user!.id, undefined, page)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e8d5a3] mb-6">My Cooks</h2>
      <CooksHistory initialCooks={cooks} initialHasMore={hasMore} pits={pits} loadMore={loadMore} />
    </div>
  )
}