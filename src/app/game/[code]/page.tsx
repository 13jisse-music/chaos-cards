'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Game, Player } from '@/types/game'
import { supabase, getPlayerId } from '@/lib/supabase'
import { startGame } from '@/lib/gameLogic'
import { isBotPlayer, botPlay } from '@/lib/botPlayer'
import Lobby from '@/components/Lobby'
import GameBoard from '@/components/GameBoard'
import Scoreboard from '@/components/Scoreboard'
import { createShuffledDeck, dealCards } from '@/lib/deck'

export default function GamePage() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [showScores, setShowScores] = useState(false)
  const [prevManche, setPrevManche] = useState(1)
  const botPlayingRef = useRef(false)

  // Charger la partie et les joueurs
  const fetchData = useCallback(async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single()

    if (gameData) {
      setGame(gameData as Game)

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameData.id)
        .order('seat_index')

      if (playersData) setPlayers(playersData as Player[])
    }
  }, [code])

  useEffect(() => {
    const pid = getPlayerId()
    setMyPlayerId(pid)
    fetchData()
  }, [fetchData])

  // Polling fallback pour le lobby (Realtime peut être lent)
  useEffect(() => {
    if (!game || game.status !== 'waiting') return
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [game?.status, fetchData])

  // Détecter changement de manche pour afficher scoreboard
  useEffect(() => {
    if (game && game.manche > prevManche) {
      setShowScores(true)
      setPrevManche(game.manche)
    }
    if (game?.status === 'finished') {
      setShowScores(true)
    }
  }, [game, prevManche])

  // Bot auto-play : quand c'est le tour d'un bot, il joue automatiquement
  useEffect(() => {
    if (!game || game.status !== 'playing' || players.length === 0) return
    if (botPlayingRef.current) return

    const currentPlayer = players.find(p => p.seat_index === game.current_player_index)
    if (!currentPlayer || !isBotPlayer(currentPlayer)) return

    botPlayingRef.current = true
    botPlay(game, currentPlayer, players)
      .then(() => {
        // Refetch après que le bot joue pour mettre à jour le state
        return fetchData()
      })
      .finally(() => {
        botPlayingRef.current = false
      })
  }, [game, players, fetchData])

  // Realtime subscriptions
  useEffect(() => {
    if (!game) return

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` },
        (payload) => {
          if (payload.new) setGame(payload.new as Game)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${game.id}` },
        () => {
          supabase
            .from('players')
            .select('*')
            .eq('game_id', game.id)
            .order('seat_index')
            .then(({ data }) => {
              if (data) setPlayers(data as Player[])
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id])

  async function handleStart() {
    if (!game) return
    await startGame(game.id)
  }

  async function handleNextManche() {
    if (!game) return
    const deck = createShuffledDeck()
    const { hands, pile, drawPile } = dealCards(deck, players.length)

    for (let i = 0; i < players.length; i++) {
      const p = players.find(pl => pl.seat_index === i)
      if (p) {
        await supabase.from('players').update({ hand: hands[i] }).eq('id', p.id)
      }
    }

    await supabase
      .from('games')
      .update({
        pile,
        draw_pile: drawPile,
        current_player_index: 0,
        direction: 1,
        current_chaos_effect: null,
      })
      .eq('id', game.id)

    setShowScores(false)
  }

  async function handleReplay() {
    if (!game) return
    const deck = createShuffledDeck()
    const { hands, pile, drawPile } = dealCards(deck, players.length)

    for (let i = 0; i < players.length; i++) {
      const p = players.find(pl => pl.seat_index === i)
      if (p) {
        await supabase.from('players').update({ hand: hands[i] }).eq('id', p.id)
      }
    }

    await supabase
      .from('games')
      .update({
        status: 'playing',
        manche: 1,
        pile,
        draw_pile: drawPile,
        current_player_index: 0,
        direction: 1,
        current_chaos_effect: null,
        scores: Object.fromEntries(players.map(p => [p.id, []])),
      })
      .eq('id', game.id)

    setShowScores(false)
    setPrevManche(1)
  }

  if (!game || !myPlayerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a]">
        <div className="text-white/50 text-lg">Chargement...</div>
      </div>
    )
  }

  const me = players.find(p => p.id === myPlayerId)
  const isHost = me?.seat_index === 0

  // Scoreboard
  if (showScores && game.scores) {
    return (
      <Scoreboard
        players={players}
        scores={game.scores}
        manche={game.manche}
        finished={game.status === 'finished'}
        isHost={isHost}
        onNextManche={handleNextManche}
        onReplay={handleReplay}
      />
    )
  }

  // Lobby
  if (game.status === 'waiting') {
    return (
      <Lobby
        gameCode={game.code}
        gameId={game.id}
        players={players}
        myPlayerId={myPlayerId}
        onStart={handleStart}
      />
    )
  }

  // Jeu
  if (game.status === 'playing') {
    return (
      <GameBoard
        game={game}
        players={players}
        myPlayerId={myPlayerId}
      />
    )
  }

  return null
}
