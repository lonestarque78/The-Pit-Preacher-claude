// apps/web/types/account.ts

export type ExperienceLevel =
  | 'beginner'
  | 'backyard'
  | 'competition'
  | 'pitmaster'

export type PitType =
  | 'offset'
  | 'kamado'
  | 'pellet'
  | 'stickburner'
  | 'electric'
  | 'kettle'
  | 'drum'
  | 'other'

export type TemperatureUnit = 'F' | 'C'

export type PreacherVoiceMode = 'normal' | 'softer' | 'competition'

export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  home_region: string | null
  timezone: string | null
  experience_level: ExperienceLevel | null
  wood_preference: string | null
  flavor_salt: number
  flavor_pepper: number
  flavor_heat: number
  flavor_sweetness: number
  flavor_smoke: number
  profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface Pit {
  id: string
  user_id: string
  name: string
  type: PitType
  brand: string | null
  model: string | null
  notes: string | null
  default_temp: number | null
  fuel_type: string | null
  default_wood: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  user_id: string
  default_pit_id: string | null
  units: TemperatureUnit
  timeline_mode: string
  preacher_voice_mode: PreacherVoiceMode
  notifications_enabled: boolean
  beta_features_enabled: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface CookHistoryRow {
  cook_id: string
  user_id: string
  started_at: string
  last_updated_at: string
  pit_id: string | null
  pit_name: string | null
  pit_type: string | null
  summary_notes: string | null
  rating: number | null
  tags: string[] | null
}

export interface ProfileFormData {
  display_name: string
  avatar_url: string
  home_region: string
  timezone: string
  experience_level: ExperienceLevel
  wood_preference: string
  flavor_salt: number
  flavor_pepper: number
  flavor_heat: number
  flavor_sweetness: number
  flavor_smoke: number
}

export interface SettingsFormData {
  units: TemperatureUnit
  preacher_voice_mode: PreacherVoiceMode
  notifications_enabled: boolean
  beta_features_enabled: boolean
  default_pit_id: string | null
}

export interface PitFormData {
  name: string
  type: PitType
  brand: string
  model: string
  notes: string
  default_temp: number | null
  fuel_type: string
  default_wood: string
  is_default: boolean
}