import { Card, CardColor, EffectType } from '@/types/game'

const COLORS: CardColor[] = ['rouge', 'bleu', 'vert', 'jaune']
const EFFECTS: EffectType[] = ['block', 'steal', 'plus2', 'swap', 'reset']
const CHAOS_EFFECTS: EffectType[] = [
  'chaos_everyone_draws',
  'chaos_swap_all',
  'chaos_reverse',
  'chaos_lowest_wins',
  'chaos_double_turn',
  'chaos_blind',
]

export function generateDeck(): Card[] {
  const cards: Card[] = []

  // 40 cartes numériques (4 couleurs x 10 valeurs)
  for (const color of COLORS) {
    for (let value = 1; value <= 10; value++) {
      cards.push({
        id: `${color}_${value}`,
        color,
        value,
        type: 'number',
        effect: null,
      })
    }
  }

  // 20 cartes effets (4 couleurs x 5 effets)
  for (const color of COLORS) {
    for (const effect of EFFECTS) {
      cards.push({
        id: `${color}_${effect}`,
        color,
        value: null,
        type: 'effect',
        effect,
      })
    }
  }

  // 12 cartes chaos (6 effets x 2)
  for (const effect of CHAOS_EFFECTS) {
    for (let i = 1; i <= 2; i++) {
      cards.push({
        id: `chaos_${effect}_${i}`,
        color: 'chaos',
        value: null,
        type: 'chaos',
        effect,
      })
    }
  }

  return cards
}

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createShuffledDeck(): Card[] {
  return shuffle(generateDeck())
}

export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number = 7) {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => [])
  let deckIndex = 0

  for (let c = 0; c < cardsPerPlayer; c++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(deck[deckIndex])
      deckIndex++
    }
  }

  // Trouver la première carte numérique pour la pile
  let firstPileCard: Card | null = null
  while (deckIndex < deck.length) {
    if (deck[deckIndex].type === 'number') {
      firstPileCard = deck[deckIndex]
      deckIndex++
      break
    }
    // Si c'est pas une carte numérique, la mettre à la fin
    deck.push(deck[deckIndex])
    deckIndex++
  }

  const drawPile = deck.slice(deckIndex)

  return { hands, pile: firstPileCard ? [firstPileCard] : [], drawPile }
}
