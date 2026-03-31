export type CardColor = 'rouge' | 'bleu' | 'vert' | 'jaune' | 'chaos'

export type CardType = 'number' | 'effect' | 'chaos'

export type EffectType =
  | 'block'
  | 'steal'
  | 'plus2'
  | 'swap'
  | 'reset'
  | 'chaos_everyone_draws'
  | 'chaos_swap_all'
  | 'chaos_reverse'
  | 'chaos_lowest_wins'
  | 'chaos_double_turn'
  | 'chaos_blind'

export interface Card {
  id: string
  color: CardColor
  value: number | null
  type: CardType
  effect: EffectType | null
}

export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface Game {
  id: string
  code: string
  status: GameStatus
  current_player_index: number
  direction: number
  pile: Card[]
  draw_pile: Card[]
  current_chaos_effect: string | null
  manche: number
  scores: Record<string, number[]>
  created_at: string
}

export interface Player {
  id: string
  game_id: string
  name: string
  avatar_color: string
  hand: Card[]
  seat_index: number
  is_ready: boolean
  pv: number
  created_at: string
}

export const AVATAR_COLORS = [
  '#ef4444', // rouge
  '#3b82f6', // bleu
  '#22c55e', // vert
  '#eab308', // jaune
  '#a855f7', // violet
  '#f97316', // orange
]

export const CARD_COLORS: Record<string, string> = {
  rouge: '#ef4444',
  bleu: '#3b82f6',
  vert: '#22c55e',
  jaune: '#eab308',
  chaos: '#1a1a1a',
}
