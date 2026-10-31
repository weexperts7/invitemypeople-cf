// A soft temple-bell strike, synthesised so there's no audio file to ship. On a
// phone the context starts suspended and a press doesn't wake it: only lifting
// the finger does. `resume` is called then, and a strike already rung just
// sounds at that moment.
export function createBell() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    return {
      ring() {
        ;[
          [659, 0.14],
          [1318, 0.06],
          [1976, 0.03],
        ].forEach(([freq, level]) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = freq
          gain.gain.setValueAtTime(level, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4)
          osc.connect(gain).connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 2.4)
        })
      },
      resume() {
        ctx.resume().catch(() => {})
      },
    }
  } catch {
    // Purely decorative — a browser without Web Audio just lights silently.
    return { ring() {}, resume() {} }
  }
}
