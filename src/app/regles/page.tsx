'use client'

import Link from 'next/link'

const RULES_SECTIONS = [
  {
    title: 'Le but du jeu',
    content: 'Se débarrasser de toutes ses cartes le plus vite possible. Le joueur qui vide sa main en premier gagne la manche. Les autres comptent les points des cartes restantes. Après 3 manches, celui qui a le MOINS de points gagne la partie.',
  },
  {
    title: 'Les cartes',
    items: [
      { label: 'Cartes numérotées (1-10)', desc: '4 couleurs : Rouge, Bleu, Vert, Jaune. Tu peux jouer une carte si elle est de la même couleur OU d\'une valeur supérieure ou égale à la carte du dessus.', points: 'Points = valeur de la carte' },
      { label: 'Cartes Effet', desc: 'Même couleur que la pile pour être jouée. Déclenche un pouvoir spécial.', points: '15 points chacune' },
      { label: 'Cartes CHAOS', desc: 'Fond noir avec éclair doré. Jouables à tout moment, peu importe la couleur ou la valeur !', points: '25 points chacune' },
    ],
  },
  {
    title: 'Comment jouer une carte',
    content: 'Quand c\'est ton tour, tu peux jouer une carte si :\n• Même couleur que la carte du dessus\n• Valeur supérieure ou égale (pour les numérotées)\n• Carte Effet de la même couleur\n• Carte CHAOS (toujours jouable)\n\nSi tu ne peux rien jouer, tu dois piocher.',
  },
  {
    title: 'Les effets spéciaux',
    items: [
      { label: '🚫 BLOCAGE', desc: 'Le joueur suivant passe son tour.' },
      { label: '+2 CARTES', desc: 'Le joueur suivant pioche 2 cartes et passe son tour.' },
      { label: '🤏 VOLER', desc: 'Tu voles une carte au hasard dans la main d\'un joueur de ton choix.' },
      { label: '🔄 ÉCHANGE', desc: 'Tu échanges toute ta main avec celle d\'un joueur de ton choix.' },
      { label: '0️⃣ REMISE À ZÉRO', desc: 'La pile repart de zéro. N\'importe quelle carte numérotée peut être jouée ensuite.' },
    ],
  },
  {
    title: 'Les cartes CHAOS',
    items: [
      { label: '🌀 Tous piochent !', desc: 'Tous les joueurs (toi compris) piochent 2 cartes.' },
      { label: '🔀 Mélange des mains !', desc: 'Toutes les mains sont collectées et redistribuées au hasard.' },
      { label: '↩️ Sens inversé !', desc: 'Le sens du jeu change et tu rejoues immédiatement.' },
      { label: '⬇️ La plus faible gagne !', desc: 'Pendant 1 tour, tu peux jouer une carte de valeur INFÉRIEURE.' },
      { label: '⚡ Double tour !', desc: 'Tu joues 2 cartes ce tour au lieu d\'une.' },
      { label: '🙈 Jeu à l\'aveugle !', desc: 'Tous les joueurs ne voient plus leurs cartes pendant 1 tour.' },
    ],
  },
  {
    title: 'Points et classement',
    content: 'Quand un joueur vide sa main, la manche s\'arrête. Les autres comptent leurs points :\n• Cartes numérotées = leur valeur (1-10)\n• Cartes Effet = 15 points\n• Cartes CHAOS = 25 points\n\nLe gagnant de la manche marque 0. Après 3 manches, celui avec le MOINS de points total gagne la partie !',
  },
]

export default function ReglesPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] bg-fixed bg-cover bg-center bg-no-repeat p-5 pb-20 overflow-y-auto" style={{ backgroundImage: 'url(/assets/bg-rules.png)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white/50 hover:text-white text-2xl">
            &larr;
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            Règles du <span className="text-yellow-400">jeu</span>
          </h1>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {RULES_SECTIONS.map((section, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-yellow-400 mb-3">{section.title}</h2>

              {section.content && (
                <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.items && (
                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{item.label}</div>
                        <div className="text-white/50 text-xs mt-0.5">{item.desc}</div>
                        {'points' in item && item.points && (
                          <div className="text-yellow-400/60 text-xs mt-0.5">{item.points}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl text-lg active:scale-95 transition-transform"
          >
            Jouer !
          </Link>
        </div>
      </div>
    </div>
  )
}
