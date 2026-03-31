import { Card, Game, Player } from '@/types/game'
import { createShuffledDeck, dealCards, shuffle } from './deck'
import { supabase } from './supabase'
import { TOTAL_MANCHES } from './constants'

// Vérifie si une carte est jouable
export function isPlayable(card: Card, topCard: Card, chaosEffect: string | null): boolean {
  // Chaos = toujours jouable
  if (card.type === 'chaos') return true

  // Effet = même couleur OU top est aussi un effet
  if (card.type === 'effect') {
    return card.color === topCard.color || topCard.type === 'effect'
  }

  // Numérique
  if (card.type === 'number') {
    // Même couleur = toujours OK
    if (card.color === topCard.color) return true
    // Valeur >= top (ou <= si chaos_lowest_wins)
    if (topCard.value !== null && card.value !== null) {
      if (chaosEffect === 'chaos_lowest_wins') {
        return card.value <= topCard.value || card.value >= topCard.value
      }
      return card.value >= topCard.value
    }
    // Si top n'a pas de valeur (effet/reset), toute carte numérique passe
    return true
  }

  return false
}

// Calcule le prochain joueur
export function nextPlayerIndex(current: number, direction: number, numPlayers: number, skip: number = 1): number {
  return ((current + direction * skip) % numPlayers + numPlayers) % numPlayers
}

// Points d'une main
export function calculateHandPoints(hand: Card[]): number {
  return hand.reduce((sum, card) => {
    if (card.type === 'chaos') return sum + 25
    if (card.type === 'effect') return sum + 15
    return sum + (card.value || 0)
  }, 0)
}

// Générer un code salon
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Créer une partie
export async function createGame(playerName: string, avatarColor: string) {
  const code = generateGameCode()

  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({ code })
    .select()
    .single()

  if (gameError) throw gameError

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      game_id: game.id,
      name: playerName,
      avatar_color: avatarColor,
      seat_index: 0,
    })
    .select()
    .single()

  if (playerError) throw playerError

  return { game, player }
}

// Rejoindre une partie
export async function joinGame(code: string, playerName: string, avatarColor: string) {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (gameError || !game) throw new Error('Partie introuvable')
  if (game.status !== 'waiting') throw new Error('Partie déjà en cours')

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', game.id)

  if (players && players.length >= 4) throw new Error('Partie pleine (4 max)')

  const seatIndex = players ? players.length : 0

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      game_id: game.id,
      name: playerName,
      avatar_color: avatarColor,
      seat_index: seatIndex,
    })
    .select()
    .single()

  if (playerError) throw playerError

  return { game, player }
}

// Lancer la partie (distribuer les cartes)
export async function startGame(gameId: string) {
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('seat_index')

  if (!players || players.length < 2) throw new Error('Il faut au moins 2 joueurs')

  const deck = createShuffledDeck()
  const { hands, pile, drawPile } = dealCards(deck, players.length)

  // Mettre à jour les mains des joueurs
  for (let i = 0; i < players.length; i++) {
    await supabase
      .from('players')
      .update({ hand: hands[i] })
      .eq('id', players[i].id)
  }

  // Mettre à jour le jeu
  await supabase
    .from('games')
    .update({
      status: 'playing',
      pile,
      draw_pile: drawPile,
      current_player_index: 0,
      direction: 1,
      manche: 1,
      scores: Object.fromEntries(players.map(p => [p.id, []])),
    })
    .eq('id', gameId)
}

// Jouer une carte
export async function playCard(
  game: Game,
  player: Player,
  cardIndex: number,
  allPlayers: Player[],
  targetPlayerId?: string
): Promise<{ needsTarget?: 'steal' | 'swap' }> {
  const card = player.hand[cardIndex]
  const topCard = game.pile[game.pile.length - 1]

  if (!isPlayable(card, topCard, game.current_chaos_effect)) {
    throw new Error('Carte non jouable')
  }

  const newHand = [...player.hand]
  newHand.splice(cardIndex, 1)

  const newPile = [...game.pile, card]
  const numPlayers = allPlayers.length

  let newPlayerIndex = game.current_player_index
  let newDirection = game.direction
  let newDrawPile = [...game.draw_pile]
  let newChaosEffect: string | null = null
  let extraTurn = false

  // Appliquer les effets
  if (card.effect) {
    switch (card.effect) {
      case 'block':
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers, 2)
        break

      case 'plus2': {
        const targetIdx = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        const targetPlayer = allPlayers.find(p => p.seat_index === targetIdx)
        if (targetPlayer) {
          const drawn = newDrawPile.splice(0, 2)
          await supabase
            .from('players')
            .update({ hand: [...targetPlayer.hand, ...drawn] })
            .eq('id', targetPlayer.id)
        }
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers, 2)
        break
      }

      case 'steal': {
        if (!targetPlayerId) return { needsTarget: 'steal' }
        const target = allPlayers.find(p => p.id === targetPlayerId)
        if (target && target.hand.length > 0) {
          const randomIdx = Math.floor(Math.random() * target.hand.length)
          const stolenCard = target.hand[randomIdx]
          const newTargetHand = [...target.hand]
          newTargetHand.splice(randomIdx, 1)
          newHand.push(stolenCard)
          await supabase.from('players').update({ hand: newTargetHand }).eq('id', target.id)
        }
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break
      }

      case 'swap': {
        if (!targetPlayerId) return { needsTarget: 'swap' }
        const target = allPlayers.find(p => p.id === targetPlayerId)
        if (target) {
          const myNewHand = [...target.hand]
          await supabase.from('players').update({ hand: newHand }).eq('id', target.id)
          newHand.length = 0
          myNewHand.forEach(c => newHand.push(c))
        }
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break
      }

      case 'reset':
        // La pile repart de 0, toute carte numérique sera jouable
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break

      case 'chaos_everyone_draws': {
        for (const p of allPlayers) {
          const drawn = newDrawPile.splice(0, 2)
          if (p.id === player.id) {
            newHand.push(...drawn)
          } else {
            await supabase
              .from('players')
              .update({ hand: [...p.hand, ...drawn] })
              .eq('id', p.id)
          }
        }
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break
      }

      case 'chaos_swap_all': {
        const allHands = allPlayers.map(p =>
          p.id === player.id ? [...newHand] : [...p.hand]
        )
        const shuffledHands = shuffle(allHands)
        for (let i = 0; i < allPlayers.length; i++) {
          if (allPlayers[i].id === player.id) {
            newHand.length = 0
            shuffledHands[i].forEach(c => newHand.push(c))
          } else {
            await supabase
              .from('players')
              .update({ hand: shuffledHands[i] })
              .eq('id', allPlayers[i].id)
          }
        }
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break
      }

      case 'chaos_reverse':
        newDirection = game.direction * -1
        extraTurn = true
        break

      case 'chaos_lowest_wins':
        newChaosEffect = 'chaos_lowest_wins'
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break

      case 'chaos_double_turn':
        extraTurn = true
        break

      case 'chaos_blind':
        newChaosEffect = 'chaos_blind'
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
        break

      default:
        newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
    }
  } else {
    // Carte numérique sans effet
    newPlayerIndex = nextPlayerIndex(game.current_player_index, game.direction, numPlayers)
  }

  if (extraTurn) {
    newPlayerIndex = game.current_player_index
  }

  // Clear chaos effect si c'était actif (sauf si on vient d'en poser un nouveau)
  if (!newChaosEffect && game.current_chaos_effect) {
    newChaosEffect = null
  }

  // Reshuffle si pioche vide
  if (newDrawPile.length === 0 && newPile.length > 1) {
    const topPile = newPile[newPile.length - 1]
    const toShuffle = newPile.slice(0, -1)
    newDrawPile = shuffle(toShuffle)
    newPile.length = 0
    newPile.push(topPile)
  }

  // Update joueur
  await supabase.from('players').update({ hand: newHand }).eq('id', player.id)

  // Update game
  await supabase
    .from('games')
    .update({
      pile: newPile,
      draw_pile: newDrawPile,
      current_player_index: newPlayerIndex,
      direction: newDirection,
      current_chaos_effect: newChaosEffect,
    })
    .eq('id', game.id)

  // Vérifier fin de manche
  if (newHand.length === 0) {
    await endManche(game, player, allPlayers)
  }

  return {}
}

// Piocher une carte
export async function drawCard(game: Game, player: Player) {
  let newDrawPile = [...game.draw_pile]
  let newPile = [...game.pile]

  // Reshuffle si pioche vide
  if (newDrawPile.length === 0 && newPile.length > 1) {
    const topPile = newPile[newPile.length - 1]
    const toShuffle = newPile.slice(0, -1)
    newDrawPile = shuffle(toShuffle)
    newPile = [topPile]
  }

  if (newDrawPile.length === 0) return // Plus rien à piocher

  const drawn = newDrawPile.shift()!
  const newHand = [...player.hand, drawn]

  const numPlayers = (await supabase
    .from('players')
    .select('id')
    .eq('game_id', game.id)).data?.length || 2

  await supabase.from('players').update({ hand: newHand }).eq('id', player.id)

  await supabase
    .from('games')
    .update({
      draw_pile: newDrawPile,
      pile: newPile,
      current_player_index: nextPlayerIndex(
        game.current_player_index,
        game.direction,
        numPlayers
      ),
      current_chaos_effect: null,
    })
    .eq('id', game.id)
}

// Fin de manche
async function endManche(game: Game, winner: Player, allPlayers: Player[]) {
  const scores = { ...(game.scores || {}) }

  for (const p of allPlayers) {
    if (!scores[p.id]) scores[p.id] = []
    if (p.id === winner.id) {
      scores[p.id].push(0)
    } else {
      const hand = p.id === winner.id ? [] : p.hand
      scores[p.id].push(calculateHandPoints(hand))
    }
  }

  if (game.manche >= TOTAL_MANCHES) {
    // Fin de partie
    await supabase
      .from('games')
      .update({ status: 'finished', scores })
      .eq('id', game.id)
  } else {
    // Nouvelle manche
    const deck = createShuffledDeck()
    const { hands, pile, drawPile } = dealCards(deck, allPlayers.length)

    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers.find(pl => pl.seat_index === i)
      if (p) {
        await supabase.from('players').update({ hand: hands[i] }).eq('id', p.id)
      }
    }

    await supabase
      .from('games')
      .update({
        manche: game.manche + 1,
        pile,
        draw_pile: drawPile,
        current_player_index: 0,
        direction: 1,
        current_chaos_effect: null,
        scores,
      })
      .eq('id', game.id)
  }
}
