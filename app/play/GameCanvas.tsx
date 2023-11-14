'use client'

import { Game } from '@/engine/entities/Game'
import { useEffect, useRef } from 'react'
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

let init = false
export default function GameCanvas({ gameId }: { gameId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const div = useRef<HTMLDivElement>(null)
  
  const authContext = useContext(AuthContext)
  
  console.log(authContext.user)

  useEffect(() => {
    if (init) return

    const game = new Game(gameId, canvas.current!, window)
    init = true
  }, [gameId])

  return (
    <>
      <div ref={div} className="w-full h-full">
        <canvas id="field" ref={canvas}></canvas>
      </div>
    </>
  )
}
