import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DangerZone } from '@/components/account/DangerZone'

export default async function DangerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>
      <DangerZone userEmail={user.email ?? ''} />
    </div>
  )
}