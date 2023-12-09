import { Game } from '@/engine/entities/Game'
import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { CharacterCard } from './CharacterCard'
import { NewCharacterCard } from './NewCharacterCard'

export function CharacterList({
  game,
  characters,
}: {
  game: Game
  characters: CharacterInfo[]
}) {
  return (
    <div className="fixed bottom-0 bg-white w-full text-black flex flex-row gap-4 p-4">
      {characters.map(
        (character) => (
          console.log(character),
          (
            <CharacterCard
              character={character}
              key={character.id}
            ></CharacterCard>
          )
        ),
      )}
      <NewCharacterCard game={game}></NewCharacterCard>
    </div>
  )
}
