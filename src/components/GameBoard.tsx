'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Game, Player } from '@/types/game'
import { isPlayable, playCard, drawCard } from '@/lib/gameLogic'
import { playCardSound, drawCardSound, chaosSound, blockSound, stealSound, yourTurnSound } from '@/lib/sounds'
import Card, { CardBack } from './Card'
import ChaosAlert from './ChaosAlert'
import PlayerSelector from './PlayerSelector'

interface GameBoardProps {
  game: Game
  players: Player[]
  myPlayerId: string
}

export default function GameBoard({ game, players, myPlayerId }: GameBoardProps) {
  const [chaosEffect, setChaosEffect] = useState<string | null>(null)
  const [pendingTarget, setPendingTarget] = useState<{ cardIndex: number; action: 'steal' | 'swap' } | null>(null)
  const [acting, setActing] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const prevTurnRef = useRef(game.current_player_index)

  const me = players.find(p => p.id === myPlayerId)
  const isMyTurn = me ? game.current_player_index === me.seat_index : false
  const topCard = game.pile[game.pile.length - 1]
  const isBlind = game.current_chaos_effect === 'chaos_blind'

  useEffect(() => {
    if (isMyTurn && prevTurnRef.current !== me?.seat_index) yourTurnSound()
    prevTurnRef.current = game.current_player_index
  }, [game.current_player_index, isMyTurn, me?.seat_index])

  const opponents = players.filter(p => p.id !== myPlayerId).sort((a, b) => a.seat_index - b.seat_index)

  const handlePlayCard = useCallback(async (cardIndex: number, targetPlayerId?: string) => {
    if (!me || !isMyTurn || acting) return
    setActing(true)
    try {
      const card = me.hand[cardIndex]
      const result = await playCard(game, me, cardIndex, players, targetPlayerId)
      if (result.needsTarget) {
        setPendingTarget({ cardIndex, action: result.needsTarget })
        setActing(false)
        return
      }
      if (card.type === 'chaos' && card.effect) { chaosSound(); setChaosEffect(card.effect) }
      else if (card.effect === 'block' || card.effect === 'plus2') blockSound()
      else if (card.effect === 'steal' || card.effect === 'swap') stealSound()
      else playCardSound()
    } catch (e) { console.error('Erreur:', e) }
    setActing(false)
  }, [me, isMyTurn, acting, game, players])

  const handleDraw = useCallback(async () => {
    if (!me || !isMyTurn || acting) return
    setActing(true)
    try { drawCardSound(); await drawCard(game, me) } catch (e) { console.error('Erreur pioche:', e) }
    setActing(false)
  }, [me, isMyTurn, acting, game])

  const handleTargetSelect = useCallback((targetPlayerId: string) => {
    if (!pendingTarget) return
    handlePlayCard(pendingTarget.cardIndex, targetPlayerId)
    setPendingTarget(null)
  }, [pendingTarget, handlePlayCard])

  if (!me || !topCard) return null

  const playableCards = me.hand.filter(c => isPlayable(c, topCard, game.current_chaos_effect))
  const mustDraw = isMyTurn && playableCards.length === 0
  const dirLabel = game.direction === 1 ? '→' : '←'

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f0f1a] bg-cover bg-center" style={{ backgroundImage: 'url(/assets/bg-game.png)' }}>
      {/* Header compact */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/50 backdrop-blur-sm shrink-0">
        <span className="text-white/50 text-xs">M{game.manche}/3</span>
        <span className="text-white/30 text-xs">{dirLabel}</span>
        <span className="text-white/50 text-xs">Pioche: {game.draw_pile.length}</span>
      </div>

      {/* Adversaires */}
      <div className="flex justify-center gap-3 px-3 py-2 shrink-0">
        {opponents.map(p => {
          const isActive = game.current_player_index === p.seat_index
          return (
            <div key={p.id} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${
                  isActive ? 'ring-2 ring-yellow-400 scale-110' : ''
                }`}
                style={{ backgroundColor: p.avatar_color }}
              >
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-white/60 text-[10px] truncate max-w-[50px]">{p.name}</span>
              <span className="text-white/30 text-[10px]">{p.hand.length} 🃏</span>
            </div>
          )
        })}
      </div>

      {/* Zone centrale */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
        {/* Chaos effect actif */}
        {game.current_chaos_effect && (
          <div className="bg-yellow-400/20 text-yellow-400 px-3 py-0.5 rounded-full text-xs font-bold animate-pulse">
            {game.current_chaos_effect === 'chaos_lowest_wins' ? '⬇️ Plus faible gagne !' :
             game.current_chaos_effect === 'chaos_blind' ? '🙈 Aveugle !' : game.current_chaos_effect}
          </div>
        )}

        {/* Pioche + Pile */}
        <div className="flex items-center gap-6">
          {/* Pioche */}
          <div className="relative">
            {game.draw_pile.length > 10 && (
              <div className="absolute top-0 left-0 translate-x-[2px] translate-y-[2px] opacity-30"><CardBack size="sm" /></div>
            )}
            {game.draw_pile.length > 5 && (
              <div className="absolute top-0 left-0 translate-x-[1px] translate-y-[1px] opacity-50"><CardBack size="sm" /></div>
            )}
            {game.draw_pile.length > 0 ? (
              <div className="relative">
                <CardBack size="sm" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-black/70 text-white/80 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {game.draw_pile.length}
                </div>
              </div>
            ) : (
              <div className="w-[55px] h-[80px] rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                <span className="text-white/20 text-[10px]">Vide</span>
              </div>
            )}
          </div>

          {/* Pile */}
          <div style={{ transform: `rotate(${(game.pile.length * 3) % 10 - 5}deg)` }}>
            <Card card={topCard} size="sm" />
          </div>
        </div>

        {/* Tour */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          isMyTurn ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/30'
        }`}>
          {isMyTurn ? 'C\'est ton tour !' : `Tour de ${players.find(p => p.seat_index === game.current_player_index)?.name || '...'}`}
        </div>

        {mustDraw && (
          <button
            onClick={handleDraw}
            disabled={acting}
            className="px-5 py-2 bg-blue-500 text-white font-bold rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            Piocher
          </button>
        )}
      </div>

      {/* Ma main */}
      <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 px-1 py-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 justify-center">
          {me.hand.map((card, idx) => {
            const cardPlayable = isMyTurn && isPlayable(card, topCard, game.current_chaos_effect)
            return (
              <Card
                key={card.id + '-' + idx}
                card={card}
                playable={cardPlayable}
                blind={isBlind}
                onClick={() => handlePlayCard(idx)}
                size="sm"
              />
            )
          })}
        </div>
        {!isMyTurn && (
          <p className="text-white/20 text-[10px] text-center mt-0.5">Attends ton tour...</p>
        )}
      </div>

      {/* Tuto */}
      {showTutorial && isMyTurn && game.manche === 1 && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70" onClick={() => setShowTutorial(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl p-5 mx-4 max-w-xs border border-yellow-400/30" onClick={e => e.stopPropagation()}>
            <h3 className="text-yellow-400 font-bold text-base mb-2 text-center">Comment jouer ?</h3>
            <div className="text-white/70 text-xs space-y-1.5">
              <p><span className="text-yellow-400">1.</span> Joue une carte de <strong>même couleur</strong> ou de <strong>valeur supérieure</strong></p>
              <p><span className="text-yellow-400">2.</span> Les cartes brillantes sont jouables, tape dessus !</p>
              <p><span className="text-yellow-400">3.</span> Pas de carte jouable ? Appuie sur <strong>Piocher</strong></p>
              <p><span className="text-yellow-400">4.</span> Les cartes <strong>noires</strong> = Chaos, jouables à tout moment !</p>
              <p><span className="text-yellow-400">5.</span> Vide ta main en premier pour gagner</p>
            </div>
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-3 py-2 bg-yellow-400 text-black font-bold rounded-xl text-sm active:scale-95 transition-transform"
            >
              C&apos;est parti !
            </button>
          </div>
        </div>
      )}

      {chaosEffect && <ChaosAlert effect={chaosEffect} onDone={() => setChaosEffect(null)} />}
      {pendingTarget && (
        <PlayerSelector players={opponents} action={pendingTarget.action} onSelect={handleTargetSelect} onCancel={() => setPendingTarget(null)} />
      )}
    </div>
  )
}
