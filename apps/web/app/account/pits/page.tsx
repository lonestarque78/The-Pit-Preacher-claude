import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPits } from '@/lib/supabase/account'
import { PitsManager } from '@/components/account/PitsManager'

export default async function PitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pits = await getPits(user.id)

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e8d5a3] mb-6">My Pits</h2>
      <PitsManager initialPits={pits} />
    </div>
  )
}