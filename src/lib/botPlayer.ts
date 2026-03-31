import { Game, Player } from '@/types/game'
import { isPlayable, playCard, drawCard } from './gameLogic'
import { supabase } from './supabase'

const BOT_NAMES = ['Robot', 'Chaos Bot', 'R2-D2', 'Wall-E']
const BOT_COLORS = ['#a855f7', '#f97316', '#06b6d4', '#ec4899']

export function getBotName(index: number): string {
  return BOT_NAMES[index % BOT_NAMES.length]
}

export function getBotColor(index: number): string {
  return BOT_COLORS[index % BOT_COLORS.length]
}

// Ajouter un bot à la partie
export async function addBot(gameId: string, existingPlayers: Player[]) {
  const botIndex = existingPlayers.filter(p => p.name.startsWith('Bot') || BOT_NAMES.includes(p.name)).length
  const seatIndex = existingPlayers.length

  if (seatIndex >= 4) throw new Error('Partie pleine')

  const { data: player, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      name: getBotName(botIndex),
      avatar_color: getBotColor(botIndex),
      seat_index: seatIndex,
      is_ready: true,
    })
    .select()
    .single()

  if (error) throw error
  return player as Player
}

// Le bot joue son tour
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function botPlay(game: Game, bot: Player, allPlayers: Player[]) {
  // Attendre un petit délai pour le réalisme
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

  // Refetch pour avoir les données les plus récentes
  const { data: freshGame } = await supabase
    .from('games')
    .select('*')
    .eq('id', game.id)
    .single()

  if (!freshGame || freshGame.status !== 'playing') return

  const { data: freshPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', game.id)
    .order('seat_index')

  if (!freshPlayers) return

  const freshBot = freshPlayers.find(p => p.id === bot.id)
  if (!freshBot) return

  // Vérifier que c'est bien le tour du bot
  if (freshGame.current_player_index !== freshBot.seat_index) return

  const topCard = freshGame.pile[freshGame.pile.length - 1]
  if (!topCard) return

  // Trouver les cartes jouables
  const playableIndices: number[] = []
  for (let i = 0; i < freshBot.hand.length; i++) {
    if (isPlayable(freshBot.hand[i], topCard, freshGame.current_chaos_effect)) {
      playableIndices.push(i)
    }
  }

  if (playableIndices.length === 0) {
    // Piocher
    await drawCard(freshGame as Game, freshBot as Player)
    return
  }

  // Stratégie simple : jouer la carte avec la plus haute valeur, ou un effet, ou un chaos
  const scored = playableIndices.map(idx => {
    const card = freshBot.hand[idx]
    let score = 0
    if (card.type === 'number') score = card.value || 0
    if (card.type === 'effect') score = 15 // Jouer les effets en priorité moyenne
    if (card.type === 'chaos') score = 20 // Les chaos en priorité haute
    // Bonus si on peut se débarrasser des cartes à gros points
    if (card.type === 'effect') score += 5
    return { idx, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const chosenIdx = scored[0].idx
  const chosenCard = freshBot.hand[chosenIdx]

  // Pour steal/swap, choisir un joueur au hasard (pas le bot)
  let targetPlayerId: string | undefined
  if (chosenCard.effect === 'steal' || chosenCard.effect === 'swap') {
    const others = freshPlayers.filter(p => p.id !== bot.id && p.hand.length > 0)
    if (others.length > 0) {
      targetPlayerId = others[Math.floor(Math.random() * others.length)].id
    }
  }

  await playCard(freshGame as Game, freshBot as Player, chosenIdx, freshPlayers as Player[], targetPlayerId)
}

// Vérifie si c'est le tour d'un bot et le fait jouer
export function isBotPlayer(player: Player): boolean {
  return BOT_NAMES.includes(player.name)
}
