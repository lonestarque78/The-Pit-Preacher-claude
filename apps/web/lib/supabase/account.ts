

import { createServerClient } from '@/lib/supabase-server'
import type {
  Profile,
  Pit,
  UserPreferences,
  CookHistoryRow,
  ProfileFormData,
  SettingsFormData,
  PitFormData,
} from '@/types/account'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('user_preferences')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function getPits(userId: string): Promise<Pit[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data as Pit[]
}

export async function getPitCount(userId: string): Promise<number> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()
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

export async function getCookHistory(
  userId: string,
  filters?: { pitId?: string; tag?: string },
  page = 0,
  pageSize = 50
): Promise<{ data: CookHistoryRow[]; hasMore: boolean }> {
  const supabase = await createServerClient()
  const from = page * pageSize
  const to = from + pageSize - 1
  let query = supabase
    .from('cook_history_view')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .range(from, to)
  if (filters?.pitId) {
    query = query.eq('pit_id', filters.pitId)
  }
  const { data, error, count } = await query
  if (error) return { data: [], hasMore: false }
  return {
    data: (data ?? []) as unknown as CookHistoryRow[],
    hasMore: (count ?? 0) > from + pageSize,
  }
}

