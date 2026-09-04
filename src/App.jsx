import { useEffect, useRef } from 'react'
import { createOMWGame } from './game/createGame'

export default function App() {
  const gameRef = useRef(null)
  const hostRef = useRef(null)

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined

    gameRef.current = createOMWGame(hostRef.current)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <main className="game-shell">
      <div className="game-frame" ref={hostRef} aria-label="OMWGod pixel-art game" />
      <p className="rotate-note">Rotate your phone. The afterlife is widescreen.</p>
    </main>
  )
}
