'use client'

import { useActionState } from 'react'
import { updateProfileAction } from '@/app/account/actions'
import type { Profile, Pit } from '@/types/account'
import {
  FormCard, FormField, SaveButton, StatusMessage,
  inputClass, selectClass,
} from './FormCard'

const EXPERIENCE_LEVELS = [
  { value: 'beginner',    label: 'Beginner — just getting started' },
  { value: 'backyard',    label: 'Backyard Cook'                   },
  { value: 'competition', label: 'Competition Pitmaster'           },
  { value: 'pitmaster',   label: 'Seasoned Pitmaster'              },
]

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

interface Props {
  profile: Profile | null
  pits: Pit[]
  defaultPitId: string | null
  userEmail: string
}

export function ProfileForm({ profile, pits, defaultPitId, userEmail }: Props) {
  const [result, action, pending] = useActionState(updateProfileAction, null)

  return (
    <form action={action} className="space-y-6">
      <FormCard>
        <div className="space-y-4">
          <p className="text-xs text-[#7a6a55]">Account: {userEmail}</p>

          <FormField label="Display Name">
            <input
              name="display_name"
              className={inputClass}
              defaultValue={profile?.display_name ?? ''}
              placeholder="How you want to be known"
              maxLength={60}
            />
          </FormField>

          <FormField label="Avatar URL" hint="Paste a direct image URL">
            <input
              name="avatar_url"
              className={inputClass}
              defaultValue={profile?.avatar_url ?? ''}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="Home Region">
            <input
              name="home_region"
              className={inputClass}
              defaultValue={profile?.home_region ?? ''}
              placeholder="e.g. Central Texas, Memphis, Kansas City"
              maxLength={100}
            />
          </FormField>

          <FormField label="Timezone">
            <select
              name="timezone"
              className={selectClass}
              defaultValue={profile?.timezone ?? 'America/Chicago'}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Experience Level">
            <select
              name="experience_level"
              className={selectClass}
              defaultValue={profile?.experience_level ?? 'backyard'}
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Preferred Wood">
            <input
              name="wood_preference"
              className={inputClass}
              defaultValue={profile?.wood_preference ?? 'Post Oak'}
              placeholder="Post Oak, Hickory, Cherry…"
              maxLength={60}
            />
          </FormField>

          {pits.length > 0 && (
            <FormField label="Default Pit" hint="Your go-to rig for new cooks">
              <select
                name="default_pit_id"
                className={selectClass}
                defaultValue={defaultPitId ?? ''}
              >
                <option value="">None (choose per cook)</option>
                {pits.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </FormField>
          )}
        </div>
      </FormCard>

      <FormCard>
        <h3 className="text-sm font-semibold text-[#c4a97d] mb-4 uppercase tracking-wider">
          Flavor Profile
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ['flavor_salt',      'Salt',      profile?.flavor_salt],
              ['flavor_pepper',    'Pepper',    profile?.flavor_pepper],
              ['flavor_heat',      'Heat',      profile?.flavor_heat],
              ['flavor_sweetness', 'Sweetness', profile?.flavor_sweetness],
              ['flavor_smoke',     'Smoke',     profile?.flavor_smoke],
            ] as [string, string, number | undefined][]
          ).map(([name, label, val]) => (
            <FormField key={name} label={`${label} (1–10)`}>
              <input
                type="number"
                name={name}
                className={inputClass}
                defaultValue={val ?? 5}
                min={1}
                max={10}
              />
            </FormField>
          ))}
        </div>
      </FormCard>

      <div className="flex items-center gap-4">
        <SaveButton pending={pending} />
        <StatusMessage result={result} />
      </div>
    </form>
  )
}