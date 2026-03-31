// Système de sons FX — synthétisés via Web Audio API (pas de fichiers externes)
let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

// Jouer une carte
export function playCardSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

// Piocher une carte
export function drawCardSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

// Carte Chaos !
export function chaosSound() {
  const ctx = getCtx()
  // Son grave menaçant + montée
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    const t = ctx.currentTime + i * 0.15
    osc.frequency.setValueAtTime(100 + i * 100, t)
    osc.frequency.exponentialRampToValueAtTime(300 + i * 200, t + 0.12)
    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14)
    osc.start(t)
    osc.stop(t + 0.14)
  }
}

// Bloquer un joueur
export function blockSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'square'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

// Voler / échanger
export function stealSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.25)
}

// C'est ton tour !
export function yourTurnSound() {
  const ctx = getCtx()
  const notes = [523, 659, 784] // Do Mi Sol
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.12
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15)
    osc.start(t)
    osc.stop(t + 0.15)
  })
}

// Gagner une manche
export function winSound() {
  const ctx = getCtx()
  const notes = [523, 659, 784, 1047] // Do Mi Sol Do+
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.15
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.3)
  })
}

// Bouton click
export function clickSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1000, ctx.currentTime)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)
}
