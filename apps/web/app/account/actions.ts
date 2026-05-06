'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase-server'
import {
  updateProfile,
  updatePreferences,
  createPit,
  updatePit,
  deletePit,
} from '@/lib/supabase/account'

const ProfileSchema = z.object({
  display_name:     z.string().min(1).max(60),
  avatar_url:       z.string().url().or(z.literal('')).optional(),
  home_region:      z.string().max(100).optional(),
  timezone:         z.string().max(60).optional(),
  experience_level: z.enum(['beginner', 'backyard', 'competition', 'pitmaster']).optional(),
  wood_preference:  z.string().max(60).optional(),
  flavor_salt:      z.coerce.number().int().min(1).max(10).optional(),
  flavor_pepper:    z.coerce.number().int().min(1).max(10).optional(),
  flavor_heat:      z.coerce.number().int().min(1).max(10).optional(),
  flavor_sweetness: z.coerce.number().int().min(1).max(10).optional(),
  flavor_smoke:     z.coerce.number().int().min(1).max(10).optional(),
})

const SettingsSchema = z.object({
  units:                 z.enum(['F', 'C']),
  preacher_voice_mode:   z.enum(['normal', 'softer', 'competition']),
  notifications_enabled: z.coerce.boolean(),
  beta_features_enabled: z.coerce.boolean(),
  default_pit_id:        z.string().uuid().nullable().optional(),
})

const PitSchema = z.object({
  name:         z.string().min(1).max(80),
  type:         z.enum(['offset', 'kamado', 'pellet', 'stickburner', 'electric', 'kettle', 'drum', 'other']),
  brand:        z.string().max(80).optional().default(''),
  model:        z.string().max(80).optional().default(''),
  notes:        z.string().max(500).optional().default(''),
  default_temp: z.coerce.number().int().min(100).max(700).nullable().optional(),
  fuel_type:    z.string().max(60).optional().default(''),
  default_wood: z.string().max(60).optional().default(''),
  is_default:   z.coerce.boolean().optional().default(false),
})

async function getAuthUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export type ActionResult = { success: boolean; error?: string }

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    const raw = Object.fromEntries(formData.entries())
    const parsed = ProfileSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error instanceof Error ? parsed.error.message : 'Invalid input' }
    }
    const { error } = await updateProfile(user.id, parsed.data)
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
    const raw = {
      ...Object.fromEntries(formData.entries()),
      notifications_enabled: formData.get('notifications_enabled') === 'on',
      beta_features_enabled:  formData.get('beta_features_enabled') === 'on',
      default_pit_id: formData.get('default_pit_id') || null,
    }
    const parsed = SettingsSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error instanceof Error ? parsed.error.message : 'Invalid input' }
    }
    const { error } = await updatePreferences(user.id, parsed.data)
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
    const raw = {
      ...Object.fromEntries(formData.entries()),
      is_default:   formData.get('is_default') === 'on',
      default_temp: formData.get('default_temp') || null,
    }
    const parsed = PitSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error instanceof Error ? parsed.error.message : 'Invalid input' }
    }
    const { error } = await createPit(user.id, parsed.data as any)
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
    const raw = {
      ...Object.fromEntries(formData.entries()),
      is_default:   formData.get('is_default') === 'on',
      default_temp: formData.get('default_temp') || null,
    }
    const parsed = PitSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error instanceof Error ? parsed.error.message : 'Invalid input' }
    }
    const { error } = await updatePit(user.id, pitId, parsed.data as any)
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