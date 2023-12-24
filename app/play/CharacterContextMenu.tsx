import { Game } from '@/engine/entities/Game'
import { useState } from 'react'
import { CharacterCard } from './CharacterCard'
import { CharacterContext } from './page'
import { ATTACK_NAMES, AttackType } from '@/engine/GlobalParameters'

export function CharacterContextMenu({ game }: { game: Game }) {
  const [characterContext, setCharacterContext] =
    useState<CharacterContext | null>(null)

  game.onCharacterContext = (context) => setCharacterContext(context)

  const classes = { ranged: 'bg-green-600', melee: 'bg-red-600', magic: 'bg-blue-600' } as Record<AttackType, string>

  const attackWithCurrent = (attackType: AttackType, opponentId: number) => {
    game.selectedCharacter?.attack(attackType, opponentId)
  };

  const buttons = <>
    {Object.entries(ATTACK_NAMES).map(([key, value]) => {
      if (!characterContext?.character) return
      const k = key as AttackType
      return <button className={`${classes[k]} p-2 text-white`} key={key} onClick={() => attackWithCurrent(k, characterContext.character.id)}>{value}</button>
    }
    )}
  </>

  return (
    characterContext && (
      <CharacterCard
        character={characterContext.character}
        position={characterContext}
        onClose={() => setCharacterContext(null)}
        attackButtons={buttons}
      >{}</CharacterCard>
    )
  )
}
