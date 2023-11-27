'use client'

import { Game } from '@/engine/entities/Game'
import { useEffect, useRef } from 'react'
import { ConnectionProperties } from '../../engine/api/Connection'

export default function GameCanvas(
  { connectionProperties }: { connectionProperties: ConnectionProperties }
) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const div = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const game = new Game(connectionProperties, canvas.current!, window)

    console.log('rerender')

    return () => game.cleanUp()
  }, [connectionProperties])

  return (
    <>
      <div ref={div} className="w-full h-full">
        <canvas id="field" ref={canvas}></canvas>
      </div>
    </>
  )
}
