'use client'

import { Player } from '@/types/game'

interface ScoreboardProps {
  players: Player[]
  scores: Record<string, number[]>
  manche: number
  finished: boolean
  isHost: boolean
  onNextManche?: () => void
  onReplay?: () => void
}

export default function Scoreboard({ players, scores, manche, finished, isHost, onNextManche, onReplay }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => {
    const totalA = (scores[a.id] || []).reduce((s, v) => s + v, 0)
    const totalB = (scores[b.id] || []).reduce((s, v) => s + v, 0)
    return totalA - totalB // Le moins de points = le meilleur
  })

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f0f1a] bg-cover bg-center bg-no-repeat p-5" style={{ backgroundImage: 'url(/assets/bg-scores.png)' }}>
      <h2 className="text-2xl font-bold text-white mb-2">
        {finished ? '🏆 Fin de partie !' : `Manche ${manche} terminée`}
      </h2>
      <p className="text-white/50 text-sm mb-6">
        {finished ? 'Le moins de points gagne' : `${3 - manche} manche${3 - manche > 1 ? 's' : ''} restante${3 - manche > 1 ? 's' : ''}`}
      </p>

      <div className="w-full max-w-sm bg-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_repeat(3,40px)_50px] gap-1 px-4 py-3 bg-white/5 text-white/40 text-xs font-medium">
          <span>Joueur</span>
          {[1, 2, 3].map(m => (
            <span key={m} className="text-center">M{m}</span>
          ))}
          <span className="text-center font-bold text-white/60">Total</span>
        </div>

        {/* Rows */}
        {sorted.map((p, rank) => {
          const playerScores = scores[p.id] || []
          const total = playerScores.reduce((s, v) => s + v, 0)

          return (
            <div
              key={p.id}
              className={`grid grid-cols-[1fr_repeat(3,40px)_50px] gap-1 px-4 py-3 border-t border-white/5 ${rank === 0 && finished ? 'bg-yellow-400/10' : ''}`}
            >
              <div className="flex items-center gap-2">
                {rank === 0 && finished && <span>👑</span>}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: p.avatar_color }}
                >
                  {p.name[0]}
                </div>
                <span className="text-white text-sm truncate">{p.name}</span>
              </div>
              {[0, 1, 2].map(m => (
                <span key={m} className="text-center text-white/60 text-sm">
                  {playerScores[m] !== undefined ? playerScores[m] : '-'}
                </span>
              ))}
              <span className="text-center text-white font-bold text-sm">{total}</span>
            </div>
          )
        })}
      </div>

      {isHost && (
        <button
          onClick={finished ? onReplay : onNextManche}
          className="mt-8 px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl text-lg active:scale-95 transition-transform"
        >
          {finished ? '🔄 Rejouer' : 'Manche suivante →'}
        </button>
      )}

      {!isHost && (
        <p className="mt-8 text-white/40 text-sm">En attente de l&apos;hôte...</p>
      )}
    </div>
  )
}
