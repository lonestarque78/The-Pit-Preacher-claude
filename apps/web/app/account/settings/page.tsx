import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { getPreferences, getPits } from '@/lib/supabase/account'
import { SettingsForm } from '@/components/account/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [prefs, pits] = await Promise.all([
    getPreferences(user.id),
    getPits(user.id),
  ])

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e8d5a3] mb-6">Settings</h2>
      <SettingsForm prefs={prefs} pits={pits} />
    </div>
  )
}