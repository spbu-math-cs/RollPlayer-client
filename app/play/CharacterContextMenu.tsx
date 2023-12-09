import { Game } from '@/engine/entities/Game'
import { useState } from 'react'
import { CharacterCard } from './CharacterCard'
import { CharacterContext } from './page'

export function CharacterContextMenu({ game }: { game: Game }) {
  const [characterContext, setCharacterContext] =
    useState<CharacterContext | null>(null)

  game.onCharacterContext = (context) => setCharacterContext(context)

  return (
    characterContext && (
      <CharacterCard
        character={characterContext.character}
        position={characterContext}
        onClose={() => setCharacterContext(null)}
      ></CharacterCard>
    )
  )
}
