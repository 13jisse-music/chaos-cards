'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AVATAR_COLORS } from '@/types/game'
import { createGame, joinGame } from '@/lib/gameLogic'
import { setPlayerId, setPlayerName } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/assets/music.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.3
    return () => { audioRef.current?.pause() }
  }, [])

  function toggleMusic() {
    if (!audioRef.current) return
    if (musicPlaying) { audioRef.current.pause() } else { audioRef.current.play() }
    setMusicPlaying(!musicPlaying)
  }

  async function handleCreate() {
    if (!name.trim()) return setError('Entre ton prénom')
    setLoading(true)
    setError('')
    try {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      const { game, player } = await createGame(name.trim(), color)
      setPlayerId(player.id)
      setPlayerName(name.trim())
      router.push(`/game/${game.code}`)
    } catch (e: unknown) { setError((e as Error).message || 'Erreur') }
    setLoading(false)
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Entre ton prénom')
    if (!joinCode.trim()) return setError('Entre le code de la partie')
    setLoading(true)
    setError('')
    try {
      const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      const { game, player } = await joinGame(joinCode.trim(), name.trim(), color)
      setPlayerId(player.id)
      setPlayerName(name.trim())
      router.push(`/game/${game.code}`)
    } catch (e: unknown) { setError((e as Error).message || 'Erreur') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f0f1a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/assets/bg-home.png)' }}>
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Bouton musique */}
      <button
        onClick={toggleMusic}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform z-50"
      >
        {musicPlaying ? '🔊' : '🔇'}
      </button>

      {/* Contenu centré */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-auto">
        {/* Logo */}
        <div className="mb-5 text-center shrink-0">
          <h1 className="text-4xl font-extrabold drop-shadow-2xl">
            <span className="text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>CHAOS</span>
            <span className="text-yellow-400" style={{ textShadow: '0 0 20px rgba(234,179,8,0.5)' }}> CARDS</span>
          </h1>
          <p className="text-white/60 text-xs mt-1">2-4 joueurs - Temps réel</p>
        </div>

        {/* Prénom */}
        <input
          type="text"
          placeholder="Ton prénom"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={15}
          className="w-full max-w-[280px] bg-black/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-white text-center text-base placeholder:text-white/40 focus:outline-none focus:border-yellow-400 mb-3 shrink-0"
        />

        {/* Créer */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full max-w-[280px] py-2.5 bg-yellow-400 text-black font-bold rounded-xl text-base mb-3 active:scale-95 transition-transform disabled:opacity-50 shrink-0"
        >
          Créer une partie
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 w-full max-w-[280px] mb-3 shrink-0">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">ou rejoindre</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Rejoindre */}
        <div className="flex gap-2 w-full max-w-[280px] mb-3 shrink-0">
          <input
            type="text"
            placeholder="CODE"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 bg-black/50 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2.5 text-white text-center text-base font-mono tracking-[0.15em] placeholder:text-white/40 focus:outline-none focus:border-yellow-400 uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 border border-white/20"
          >
            GO
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="text-red-400 text-xs text-center bg-red-400/10 px-3 py-1.5 rounded-xl mb-2 shrink-0">
            {error}
          </div>
        )}

        {/* Règles */}
        <a href="/regles" className="text-yellow-400/60 text-xs underline underline-offset-2 hover:text-yellow-400 shrink-0">
          Comment jouer ?
        </a>
      </div>

      {/* Footer collé en bas */}
      <div className="relative z-10 text-white/20 text-[10px] text-center py-2 shrink-0">
        Inspiré de UNO et Skyjo
      </div>
    </div>
  )
}
