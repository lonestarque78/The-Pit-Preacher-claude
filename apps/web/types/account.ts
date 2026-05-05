 
// apps/web/lib/supabase/account.ts
import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  Pit,
  UserPreferences,
  CookHistoryRow,
  ProfileFormData,
  SettingsFormData,
  PitFormData,
} from '@/types/account'

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export async function updateProfile(
  userId: string,
  payload: Partial<ProfileFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as UserPreferences
}

export async function updatePreferences(
  userId: string,
  payload: Partial<SettingsFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_preferences')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

// ─── Pits ────────────────────────────────────────────────────────────────────

export async function getPits(userId: string): Promise<Pit[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data as Pit[]
}

export async function getPitCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('pits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

export async function createPit(
  userId: string,
  payload: PitFormData
): Promise<{ data: Pit | null; error: string | null }> {
  const count = await getPitCount(userId)
  if (count >= 3) {
    return { data: null, error: 'You can only save up to 3 pits.' }
  }
  const supabase = await createClient()
  if (payload.is_default) {
    await supabase
      .from('pits')
      .update({ is_default: false })
      .eq('user_id', userId)
  }
  const { data, error } = await supabase
    .from('pits')
    .insert({ ...payload, user_id: userId })
    .select()
    .single()
  return { data: data as Pit | null, error: error?.message ?? null }
}

export async function updatePit(
  userId: string,
  pitId: string,
  payload: Partial<PitFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  if (payload.is_default) {
    await supabase
      .from('pits')
      .update({ is_default: false })
      .eq('user_id', userId)
  }
  const { error } = await supabase
    .from('pits')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', pitId)
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function deletePit(
  userId: string,
  pitId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pits')
    .delete()
    .eq('id', pitId)
    .eq('user_id', userId)
  if (!error) {
    const prefs = await getPreferences(userId)
    if (prefs?.default_pit_id === pitId) {
      await supabase
        .from('user_preferences')
        .update({ default_pit_id: null })
        .eq('user_id', userId)
    }
  }
  return { error: error?.message ?? null }
}

// ─── Cook History ─────────────────────────────────────────────────────────────

export async function getCookHistory(
  userId: string,
  filters?: { pitId?: string; tag?: string }
): Promise<CookHistoryRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('cook_history_view')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (filters?.pitId) {
    query = query.eq('pit_id', filters.pitId)
  }
  const { data, error } = await query
  if (error) return []
  return data as CookHistoryRow[]
}