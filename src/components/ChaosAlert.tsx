'use client'

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

const CHAOS_MESSAGES: Record<string, string> = {
  chaos_everyone_draws: 'Tout le monde pioche 2 cartes !',
  chaos_swap_all: 'Toutes les mains sont redistribuées !',
  chaos_reverse: 'Le sens du jeu est inversé !',
  chaos_lowest_wins: 'La carte la plus faible gagne ce tour !',
  chaos_double_turn: 'Tu rejoues immédiatement !',
  chaos_blind: 'Cartes cachées pendant 1 tour !',
}

const CHAOS_IMAGES: Record<string, string> = {
  chaos_everyone_draws: '/assets/chaos-everyone-draws.png',
  chaos_swap_all: '/assets/chaos-swap-all.png',
  chaos_reverse: '/assets/chaos-reverse.png',
  chaos_lowest_wins: '/assets/chaos-lowest-wins.png',
  chaos_double_turn: '/assets/chaos-double-turn.png',
  chaos_blind: '/assets/chaos-blind.png',
}

export default function ChaosAlert({ effect, onDone }: { effect: string; onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const dismiss = useCallback(() => {
    onDoneRef.current()
  }, [])

  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
    const timer = setTimeout(dismiss, 2500)
    return () => clearTimeout(timer)
  }, [effect, dismiss])

  const img = CHAOS_IMAGES[effect]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 animate-shake cursor-pointer"
      onClick={dismiss}
    >
      <div className="text-center px-4 max-w-sm">
        {img && (
          <div className="mx-auto mb-4 rounded-xl overflow-hidden shadow-2xl shadow-yellow-400/20 border border-yellow-400/30">
            <Image src={img} alt={effect} width={400} height={260} className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="text-xl text-white font-semibold drop-shadow-lg">
          {CHAOS_MESSAGES[effect] || effect}
        </div>

        <div className="text-white/30 text-xs mt-3">Tap pour fermer</div>
      </div>
    </div>
  )
}
