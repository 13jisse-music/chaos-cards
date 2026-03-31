import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helpers localStorage pour identifier le joueur
export function getPlayerId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('chaos_player_id')
}

export function setPlayerId(id: string) {
  localStorage.setItem('chaos_player_id', id)
}

export function getPlayerName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('chaos_player_name')
}

export function setPlayerName(name: string) {
  localStorage.setItem('chaos_player_name', name)
}
