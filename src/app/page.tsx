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
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  function toggleMusic() {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
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
    } catch (e: unknown) {
      setError((e as Error).message || 'Erreur')
    }
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
    } catch (e: unknown) {
      setError((e as Error).message || 'Erreur')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0f0f1a] bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/assets/bg-home.png)' }}>
      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenu par dessus l'overlay */}
      <div className="relative z-10 flex flex-col items-center w-full">

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold mb-1 drop-shadow-2xl">
          <span className="text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>CHAOS</span>
          <span className="text-yellow-400" style={{ textShadow: '0 0 20px rgba(234,179,8,0.5)' }}> CARDS</span>
        </h1>
        <p className="text-white/60 text-sm font-medium">2-4 joueurs - Temps réel</p>
      </div>

      {/* Champ prénom */}
      <input
        type="text"
        placeholder="Ton prénom"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={15}
        className="w-full max-w-xs bg-black/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white text-center text-lg placeholder:text-white/40 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 mb-6"
      />

      {/* Bouton créer */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full max-w-xs py-3 bg-yellow-400 text-black font-bold rounded-xl text-lg mb-4 active:scale-95 transition-transform disabled:opacity-50"
      >
        Créer une partie
      </button>

      {/* Séparateur */}
      <div className="flex items-center gap-3 w-full max-w-xs mb-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-sm">ou rejoindre</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Rejoindre */}
      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          placeholder="CODE"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-lg font-mono tracking-[0.2em] placeholder:text-white/30 focus:outline-none focus:border-yellow-400 uppercase"
        />
        <button
          onClick={handleJoin}
          disabled={loading}
          className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 border border-white/20"
        >
          GO
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-4 text-red-400 text-sm text-center bg-red-400/10 px-4 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* Lien règles */}
      <a
        href="/regles"
        className="mt-6 text-yellow-400/60 text-sm underline underline-offset-2 hover:text-yellow-400"
      >
        Comment jouer ?
      </a>

      {/* Bouton musique */}
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg active:scale-90 transition-transform z-50"
        title={musicPlaying ? 'Couper la musique' : 'Lancer la musique'}
      >
        {musicPlaying ? '🔊' : '🔇'}
      </button>

      {/* Footer */}
      <div className="mt-8 text-white/20 text-xs text-center">
        Inspiré de UNO et Skyjo - Cartes Chaos imprévisibles
      </div>

      </div>{/* fin z-10 */}
    </div>
  )
}
