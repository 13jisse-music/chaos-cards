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
  const me = players.find(p => p.id === myPlayerId)
  const isHost = me?.seat_index === 0
  const allReady = players.length >= 2 && players.every(p => p.is_ready)

  const hasBotAlready = players.some(p => isBotPlayer(p))

  async function handleAddBot() {
    if (addingBot || players.length >= 4 || hasBotAlready) return
    setAddingBot(true)
    try {
      await addBot(gameId, players)
    } catch (e) {
      console.error(e)
    }
    setAddingBot(false)
  }

  async function toggleReady() {
    if (!me) return
    await supabase
      .from('players')
      .update({ is_ready: !me.is_ready })
      .eq('id', me.id)
  }

  async function changeColor(color: string) {
    if (!me) return
    await supabase
      .from('players')
      .update({ avatar_color: color })
      .eq('id', me.id)
  }

  function copyCode() {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const takenColors = players.filter(p => p.id !== myPlayerId).map(p => p.avatar_color)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1a] bg-cover bg-center bg-no-repeat p-6" style={{ backgroundImage: 'url(/assets/bg-lobby.png)' }}>
      <h1 className="text-3xl font-bold text-white mb-2">CHAOS CARDS</h1>
      <p className="text-white/50 text-sm mb-6">Partage ce code à tes amis</p>

      {/* Code salon */}
      <button
        onClick={copyCode}
        className="bg-white/10 border-2 border-dashed border-white/30 rounded-2xl px-8 py-4 mb-8 active:scale-95 transition-transform"
      >
        <div className="text-4xl font-mono font-bold text-yellow-400 tracking-[0.3em]">
          {gameCode}
        </div>
        <div className="text-white/40 text-xs mt-1 text-center">
          {copied ? '✓ Copié !' : 'Tap pour copier'}
        </div>
      </button>

      {/* Joueurs */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        {players.map(p => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: p.avatar_color }}
            >
              {p.name[0].toUpperCase()}
            </div>
            <span className="text-white font-medium flex-1">{p.name}</span>
            {p.id === myPlayerId && <span className="text-yellow-400 text-xs">Toi</span>}
            {p.is_ready && <span className="text-green-400 text-sm">✓ Prêt</span>}
            {p.seat_index === 0 && <span className="text-yellow-400/60 text-xs">👑</span>}
          </div>
        ))}
        {players.length < 4 && !hasBotAlready && (
          <button
            onClick={handleAddBot}
            disabled={addingBot}
            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-dashed border-white/10 w-full hover:bg-white/10 active:bg-white/15 transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              🤖
            </div>
            <span className="text-purple-300/60">+ Ajouter un bot (test solo)</span>
          </button>
        )}
      </div>

      {/* Choix couleur */}
      <div className="mb-8">
        <p className="text-white/40 text-xs text-center mb-2">Ta couleur</p>
        <div className="flex gap-2">
          {AVATAR_COLORS.map(color => (
            <button
              key={color}
              onClick={() => changeColor(color)}
              className={`w-10 h-10 rounded-full transition-all ${
                me?.avatar_color === color ? 'ring-2 ring-white scale-110' : ''
              } ${takenColors.includes(color) ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}`}
              style={{ backgroundColor: color }}
              disabled={takenColors.includes(color)}
            />
          ))}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={toggleReady}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
            me?.is_ready
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-white border border-white/20'
          }`}
        >
          {me?.is_ready ? '✓ Prêt !' : 'Je suis prêt'}
        </button>

        {isHost && allReady && (
          <button
            onClick={onStart}
            className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl text-lg animate-pulse active:scale-95"
          >
            🚀 Lancer la partie !
          </button>
        )}

        {isHost && !allReady && players.length >= 2 && (
          <p className="text-white/30 text-sm text-center">Tous les joueurs doivent être prêts</p>
        )}
      </div>
    </div>
  )
}
