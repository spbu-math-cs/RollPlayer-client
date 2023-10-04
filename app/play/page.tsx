'use client'

import { Field } from '@/engine/render/Field'
import { useEffect, useRef } from 'react'
import GameCanvas from './GameCanvas'
// @ts-ignore
import BoardPIXI from "@/board/board";

export default function PlayPage() {
  // const gameId = ''
  //
  // return (
  //   <>
  //     <GameCanvas gameId={gameId} />
  //   </>
  // )
  return (
    <>
      <BoardPIXI />
    </>
  )
}
