'use client'

import { Game } from '@/engine/entities/Game'
import { useEffect, useRef, useState } from 'react'
import { Connection, ConnectionProperties } from '../../engine/api/Connection'
import { CharacterList } from './CharacterList'
import { CharacterContextMenu } from './CharacterContextMenu'
import { CharacterInfo } from '@/engine/entities/CharacterInfo'

export default function GameScreen({
  connectionProperties,
}: {
  connectionProperties: ConnectionProperties
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [players, setPlayers] = useState<CharacterInfo[]>([])
  const [game, setGame] = useState<Game | null>(null)

  const handleCharacterOp = (connection: Connection) => {
    const players = [...connection.characters.values()]
    console.log(players)
    setPlayers(players)
  }

  useEffect(() => {
    const game = new Game(connectionProperties, canvas.current!, window)

    game.connection.on('character:new', () =>
      handleCharacterOp(game.connection),
    )
    game.connection.on('character:leave', () =>
      handleCharacterOp(game.connection),
    )

    game.startUp()

    setGame(game)

    return () => game.cleanUp()
  }, [connectionProperties])

  return (
    <>
      <div className="w-full h-full">
        <canvas id="field" ref={canvas}></canvas>
        {game && (
          <CharacterList game={game} characters={players}></CharacterList>
        )}
      </div>
      {game && <CharacterContextMenu game={game}></CharacterContextMenu>}
    </>
  )
}
