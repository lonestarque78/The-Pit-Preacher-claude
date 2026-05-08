'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import type {
  ExperienceLevel,
  TemperatureUnit,
  PreacherVoiceMode,
  PitType,
  PitFormData,
  ProfileFormData,
} from '@/types/account'
import {
  updateProfile,
  updatePreferences,
  createPit,
  updatePit,
  deletePit,
} from '@/lib/supabase/account'

export type ActionResult = { success: boolean; error?: string }

async function getAuthUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    const display_name = formData.get('display_name') as string
    if (!display_name?.trim()) return { success: false, error: 'Display name is required.' }

    const payload: ProfileFormData = {
      display_name: display_name.trim(),
      avatar_url: (formData.get('avatar_url') as string) || null,
      home_region: (formData.get('home_region') as string) || null,
      timezone: (formData.get('timezone') as string) || null,
      experience_level: formData.get('experience_level') as ExperienceLevel | null,
      wood_preference: (formData.get('wood_preference') as string) || null,
      flavor_salt: Number(formData.get('flavor_salt')) || 6,
      flavor_pepper: Number(formData.get('flavor_pepper')) || 6,
      flavor_heat: Number(formData.get('flavor_heat')) || 4,
      flavor_sweetness: Number(formData.get('flavor_sweetness')) || 5,
      flavor_smoke: Number(formData.get('flavor_smoke')) || 7,
    }

    const { error } = await updateProfile(user.id, payload)
    if (error) return { success: false, error }

    revalidatePath('/account/profile')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function updateSettingsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const payload = {
      units: (formData.get('units') as TemperatureUnit) || 'F',
      preacher_voice_mode:
        (formData.get('preacher_voice_mode') as PreacherVoiceMode) || 'normal',
      notifications_enabled: formData.get('notifications_enabled') === 'on',
      beta_features_enabled: formData.get('beta_features_enabled') === 'on',
      default_pit_id: (formData.get('default_pit_id') as string) || null,
    }

    const { error } = await updatePreferences(user.id, payload)
    if (error) return { success: false, error }

    revalidatePath('/account/settings')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function createPitAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const name = formData.get('name') as string
    if (!name?.trim()) return { success: false, error: 'Pit name is required.' }

    const payload: PitFormData = {
      name: name.trim(),
      type: ((formData.get('type') as string) || 'offset') as PitType,
      brand: (formData.get('brand') as string) || '',
      model: (formData.get('model') as string) || '',
      notes: (formData.get('notes') as string) || '',
      default_temp: formData.get('default_temp')
        ? Number(formData.get('default_temp'))
        : null,
      fuel_type: (formData.get('fuel_type') as string) || '',
      default_wood: (formData.get('default_wood') as string) || '',
      is_default: formData.get('is_default') === 'on',
    }

    const { error } = await createPit(user.id, payload)
    if (error) return { success: false, error }

    revalidatePath('/account/pits')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function updatePitAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const pitId = formData.get('pit_id') as string
    if (!pitId) return { success: false, error: 'Missing pit ID.' }

    const name = formData.get('name') as string
    if (!name?.trim()) return { success: false, error: 'Pit name is required.' }

    const payload: PitFormData = {
      name: name.trim(),
      type: ((formData.get('type') as string) || 'offset') as PitType,
      brand: (formData.get('brand') as string) || '',
      model: (formData.get('model') as string) || '',
      notes: (formData.get('notes') as string) || '',
      default_temp: formData.get('default_temp')
        ? Number(formData.get('default_temp'))
        : null,
      fuel_type: (formData.get('fuel_type') as string) || '',
      default_wood: (formData.get('default_wood') as string) || '',
      is_default: formData.get('is_default') === 'on',
    }

    const { error } = await updatePit(user.id, pitId, payload)
    if (error) return { success: false, error }

    revalidatePath('/account/pits')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function deletePitAction(pitId: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser()

    const { error } = await deletePit(user.id, pitId)
    if (error) return { success: false, error }

    revalidatePath('/account/pits')
    revalidatePath('/account/profile')
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
