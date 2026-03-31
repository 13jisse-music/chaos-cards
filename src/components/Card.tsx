'use client'

import Image from 'next/image'
import { Card as CardType, CARD_COLORS } from '@/types/game'

const EFFECT_LABELS: Record<string, string> = {
  block: 'BLOCAGE',
  steal: 'VOLER',
  plus2: '+2 CARTES',
  swap: 'ÉCHANGE',
  reset: 'REMISE À ZÉRO',
  chaos_everyone_draws: 'TOUS PIOCHENT !',
  chaos_swap_all: 'MÉLANGE DES MAINS !',
  chaos_reverse: 'SENS INVERSÉ !',
  chaos_lowest_wins: 'LA PLUS FAIBLE GAGNE !',
  chaos_double_turn: 'DOUBLE TOUR !',
  chaos_blind: 'JEU À L\'AVEUGLE !',
}

// Images individuelles pour les cartes effet
const EFFECT_CARD_IMAGES: Record<string, string> = {
  block: '/assets/card-block.png',
  steal: '/assets/card-steal.png',
  plus2: '/assets/card-plus2.png',
  swap: '/assets/card-swap.png',
  reset: '/assets/card-reset.png',
}

// Fond couleur pour cartes numérotées (gradient riche)
const NUMBER_BG: Record<string, string> = {
  rouge: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
  bleu: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)',
  vert: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
  jaune: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
}

// Bordure couleur pour cartes numérotées
const NUMBER_BORDER: Record<string, string> = {
  rouge: '#fca5a5',
  bleu: '#93c5fd',
  vert: '#86efac',
  jaune: '#fde047',
}

interface CardProps {
  card: CardType
  playable?: boolean
  blind?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
  played?: boolean
}

export default function Card({ card, playable = false, blind = false, onClick, size = 'md', played = false }: CardProps) {
  const isChaos = card.type === 'chaos'
  const isEffect = card.type === 'effect'
  const isNumber = card.type === 'number'
  const w = size === 'sm' ? 55 : 70
  const h = size === 'sm' ? 80 : 100

  if (blind) {
    return (
      <div
        onClick={playable ? onClick : undefined}
        className={`rounded-xl overflow-hidden shrink-0 transition-all duration-200
          ${playable ? 'cursor-pointer card-playable active:scale-95' : 'opacity-40'}`}
        style={{ width: w, height: h }}
      >
        <Image src="/assets/card-back.png" alt="?" width={w} height={h} className="w-full h-full object-cover rounded-xl" />
      </div>
    )
  }

  // Carte numérotée : fond gradient riche + valeur en gros
  if (isNumber) {
    const bg = NUMBER_BG[card.color] || NUMBER_BG.rouge
    const border = NUMBER_BORDER[card.color] || '#fff'
    return (
      <div
        onClick={playable ? onClick : undefined}
        className={`rounded-xl shrink-0 select-none transition-all duration-200 relative overflow-hidden
          ${playable ? 'cursor-pointer card-playable active:scale-95' : 'opacity-40 cursor-not-allowed'}
          ${played ? 'card-played' : ''}`}
        style={{ width: w, height: h, background: bg, border: `2px solid ${border}40` }}
      >
        {/* Déco coins */}
        <div className="absolute top-1 left-1.5 text-white/40 text-[8px] font-bold">{card.value}</div>
        <div className="absolute bottom-1 right-1.5 text-white/40 text-[8px] font-bold rotate-180">{card.value}</div>
        {/* Valeur centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-extrabold text-white ${size === 'sm' ? 'text-2xl' : 'text-4xl'}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.15)' }}
          >
            {card.value}
          </span>
        </div>
        {/* Reflet brillant */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
        {/* Inner glow */}
        <div className="absolute inset-[2px] rounded-[10px] border border-white/10 pointer-events-none" />
      </div>
    )
  }

  // Carte effet : image design complète
  if (isEffect && card.effect) {
    const img = EFFECT_CARD_IMAGES[card.effect]
    if (img) {
      return (
        <div
          onClick={playable ? onClick : undefined}
          className={`rounded-xl shrink-0 select-none transition-all duration-200 relative overflow-hidden
            ${playable ? 'cursor-pointer card-playable active:scale-95' : 'opacity-40 cursor-not-allowed'}
            ${played ? 'card-played' : ''}`}
          style={{ width: w, height: h }}
        >
          <Image src={img} alt={EFFECT_LABELS[card.effect]} width={w} height={h} className="w-full h-full object-cover rounded-xl" />
        </div>
      )
    }
  }

  // Carte Chaos
  if (isChaos) {
    const bgColor = CARD_COLORS[card.color] || '#1a1a1a'
    return (
      <div
        onClick={playable ? onClick : undefined}
        className={`rounded-xl border-2 border-yellow-400 shrink-0 select-none transition-all duration-200 relative overflow-hidden
          ${playable ? 'cursor-pointer card-playable active:scale-95' : 'opacity-40 cursor-not-allowed'}
          ${played ? 'card-played' : ''}`}
        style={{ width: w, height: h, backgroundColor: bgColor }}
      >
        {/* Éclair en fond */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/assets/chaos-bolt.png" alt="" width={w - 10} height={w - 10} className="object-contain opacity-60" />
        </div>
        {/* Label */}
        <div className="absolute bottom-1 left-0 right-0 text-center px-1">
          <span className={`font-bold text-yellow-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${size === 'sm' ? 'text-[6px]' : 'text-[8px]'} leading-tight`}>
            {EFFECT_LABELS[card.effect || ''] || 'CHAOS'}
          </span>
        </div>
        <div className="absolute inset-0 border border-yellow-400/20 rounded-xl pointer-events-none" />
      </div>
    )
  }

  return null
}

// Dos de carte avec image
export function CardBack({ size = 'md' }: { color?: string; initial?: string; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 55 : 70
  const h = size === 'sm' ? 80 : 100

  return (
    <div className="rounded-xl overflow-hidden shrink-0 shadow-lg" style={{ width: w, height: h }}>
      <Image src="/assets/card-back.png" alt="Carte" width={w} height={h} className="w-full h-full object-cover" />
    </div>
  )
}
