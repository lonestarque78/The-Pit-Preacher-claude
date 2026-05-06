import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { getProfile, getPits, getPreferences } from '@/lib/supabase/account'
import { ProfileForm } from '@/components/account/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, pits, prefs] = await Promise.all([
    getProfile(user.id),
    getPits(user.id),
    getPreferences(user.id),
  ])

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#e8d5a3] mb-6">Profile</h2>
      <ProfileForm
        profile={profile}
        pits={pits}
        defaultPitId={prefs?.default_pit_id ?? null}
        userEmail={user.email ?? ''}
      />
    </div>
  )
}