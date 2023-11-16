'use client'

import { Game } from '@/engine/entities/Game'
import { useEffect, useRef } from 'react'

export default function GameCanvas({ gameId }: { gameId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const div = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const game = new Game(gameId, canvas.current!, window)

    console.log('rerender')

    return () => game.cleanUp()
  }, [gameId])

  return (
    <>
      <div ref={div} className="w-full h-full">
        <canvas id="field" ref={canvas}></canvas>
      </div>
    </>
  )
}
