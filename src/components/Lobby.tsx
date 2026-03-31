'use client'

import { useState } from 'react'
import { Player, AVATAR_COLORS } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { addBot, isBotPlayer } from '@/lib/botPlayer'

interface LobbyProps {
  gameCode: string
  gameId: string
  players: Player[]
  myPlayerId: string
  onStart: () => void
}

export default function Lobby({ gameCode, gameId, players, myPlayerId, onStart }: LobbyProps) {
  const [copied, setCopied] = useState(false)
  const [addingBot, setAddingBot] = useState(false)
  const [optimisticReady, setOptimisticReady] = useState<boolean | null>(null)
  const me = players.find(p => p.id === myPlayerId)
  const isHost = me?.seat_index === 0
  const amIReady = optimisticReady !== null ? optimisticReady : (me?.is_ready ?? false)
  const allReady = players.length >= 2 && players.every(p =>
    p.id === myPlayerId ? amIReady : p.is_ready
  )
  const hasBotAlready = players.some(p => isBotPlayer(p))

  async function handleAddBot() {
    if (addingBot || players.length >= 4 || hasBotAlready) return
    setAddingBot(true)
    try { await addBot(gameId, players) } catch (e) { console.error(e) }
    setAddingBot(false)
  }

  async function toggleReady() {
    if (!me) return
    const newReady = !amIReady
    setOptimisticReady(newReady) // UI change immédiatement
    await supabase.from('players').update({ is_ready: newReady }).eq('id', me.id)
  }

  async function changeColor(color: string) {
    if (!me) return
    await supabase.from('players').update({ avatar_color: color }).eq('id', me.id)
  }

  function copyCode() {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const takenColors = players.filter(p => p.id !== myPlayerId).map(p => p.avatar_color)

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f0f1a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/assets/bg-lobby.png)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-1 shrink-0">CHAOS CARDS</h1>
        <p className="text-white/50 text-xs mb-4 shrink-0">Partage ce code à tes amis</p>

        {/* Code salon */}
        <button
          onClick={copyCode}
          className="bg-white/10 border-2 border-dashed border-white/30 rounded-xl px-6 py-2.5 mb-4 active:scale-95 transition-transform shrink-0"
        >
          <div className="text-3xl font-mono font-bold text-yellow-400 tracking-[0.25em]">
            {gameCode}
          </div>
          <div className="text-white/40 text-[10px] mt-0.5 text-center">
            {copied ? '✓ Copié !' : 'Tap pour copier'}
          </div>
        </button>

        {/* Joueurs */}
        <div className="w-full max-w-xs space-y-2 mb-4 shrink-0">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm rounded-xl px-3 py-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: p.avatar_color }}
              >
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-white font-medium text-sm flex-1">{p.name}</span>
              {p.id === myPlayerId && <span className="text-yellow-400 text-[10px]">Toi</span>}
              {p.is_ready && <span className="text-green-400 text-xs">✓</span>}
              {p.seat_index === 0 && <span className="text-yellow-400/60 text-[10px]">👑</span>}
            </div>
          ))}
          {players.length < 4 && !hasBotAlready && (
            <button
              onClick={handleAddBot}
              disabled={addingBot}
              className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2 border border-dashed border-white/10 w-full active:bg-white/10 transition-colors disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
                🤖
              </div>
              <span className="text-purple-300/60 text-sm">+ Ajouter un bot</span>
            </button>
          )}
        </div>

        {/* Couleurs */}
        <div className="mb-4 shrink-0">
          <p className="text-white/40 text-[10px] text-center mb-1.5">Ta couleur</p>
          <div className="flex gap-2">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  me?.avatar_color === color ? 'ring-2 ring-white scale-110' : ''
                } ${takenColors.includes(color) ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}`}
                style={{ backgroundColor: color }}
                disabled={takenColors.includes(color)}
              />
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2 w-full max-w-xs shrink-0">
          <button
            onClick={toggleReady}
            className={`w-full py-2.5 rounded-xl font-bold text-base transition-all active:scale-95 ${
              amIReady ? 'bg-green-500 text-white' : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            {amIReady ? '✓ Prêt !' : 'Je suis prêt'}
          </button>

          {isHost && allReady && (
            <button
              onClick={onStart}
              className="w-full py-2.5 bg-yellow-400 text-black font-bold rounded-xl text-base animate-pulse active:scale-95"
            >
              Lancer la partie !
            </button>
          )}

          {isHost && !allReady && players.length >= 2 && (
            <p className="text-white/30 text-xs text-center">Tous les joueurs doivent être prêts</p>
          )}
        </div>
      </div>
    </div>
  )
}
