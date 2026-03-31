'use client'

import { Player } from '@/types/game'

interface PlayerSelectorProps {
  players: Player[]
  action: 'steal' | 'swap'
  onSelect: (playerId: string) => void
  onCancel: () => void
}

export default function PlayerSelector({ players, action, onSelect, onCancel }: PlayerSelectorProps) {
  const title = action === 'steal' ? 'Voler une carte à...' : 'Échanger ta main avec...'

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onCancel}>
      <div
        className="bg-[#1a1a2e] w-full max-w-md rounded-t-2xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-bold mb-4 text-center">{title}</h3>
        <div className="flex flex-col gap-3">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: p.avatar_color }}
              >
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-white font-medium">{p.name}</span>
              <span className="text-white/40 ml-auto text-sm">{p.hand.length} cartes</span>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-4 py-2 text-white/50 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
