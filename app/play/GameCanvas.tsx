import { Field } from '@/engine/render/Field'
import { useEffect, useRef } from 'react'

export default function GameCanvas({ gameId }: { gameId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const div = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(canvas.current)
    const game = new Field(gameId, canvas.current!)
  }, [gameId])

  return (
    <>
      <div ref={div} className="w-full h-full">
        <canvas id="field" ref={canvas}></canvas>
      </div>
    </>
  )
}
