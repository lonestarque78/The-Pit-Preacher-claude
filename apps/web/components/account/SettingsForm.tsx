'use client'

import { useActionState } from 'react'
import { updateSettingsAction } from '@/app/account/actions'
import type { UserPreferences } from '@/types/account'
import { FormCard, FormField, SaveButton, StatusMessage, selectClass } from './FormCard'

interface Props {
  prefs: UserPreferences | null
}

export function SettingsForm({ prefs }: Props) {
  const [result, action, pending] = useActionState(updateSettingsAction, null)

  return (
    <form action={action} className="space-y-6">
      <FormCard>
        <div className="space-y-4">
          <FormField label="Temperature Units">
            <select name="units" className={selectClass} defaultValue={prefs?.units ?? 'F'}>
              <option value="F">Fahrenheit (°F)</option>
              <option value="C">Celsius (°C)</option>
            </select>
          </FormField>

          <FormField label="Preacher Voice" hint="Controls the tone of cook guidance">
            <select
              name="preacher_voice_mode"
              className={selectClass}
              defaultValue={prefs?.preacher_voice_mode ?? 'normal'}
            >
              <option value="normal">Standard</option>
              <option value="softer">Softer — more encouraging</option>
              <option value="competition">Competition — straight fire</option>
            </select>
          </FormField>
        </div>
      </FormCard>

      <FormCard>
        <h3 className="text-sm font-semibold text-[#c4a97d] mb-4 uppercase tracking-wider">
          Features
        </h3>
        <div className="space-y-4">
          <Toggle
            name="notifications_enabled"
            label="Notifications"
            hint="Cook reminders and milestone alerts"
            defaultChecked={prefs?.notifications_enabled ?? true}
          />
          <Toggle
            name="beta_features_enabled"
            label="Beta Features"
            hint="Early access to features in testing"
            defaultChecked={prefs?.beta_features_enabled ?? false}
          />
        </div>
      </FormCard>

      <div className="flex items-center gap-4">
        <SaveButton pending={pending} />
        <StatusMessage result={result} />
      </div>
    </form>
  )
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string
  label: string
  hint: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-10 h-6 rounded-full bg-[#2e2820] border border-[#3e3228] peer-checked:bg-[#c4a97d] transition-colors" />
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white peer-checked:translate-x-4 transition-transform" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#e8d5a3]">{label}</p>
        <p className="text-xs text-[#7a6a55]">{hint}</p>
      </div>
    </label>
  )
}