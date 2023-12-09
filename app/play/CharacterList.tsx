import { Game } from '@/engine/entities/Game'
import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { CharacterCard } from './CharacterCard'
import { NewCharacterCard } from './NewCharacterCard'
import Swal from 'sweetalert2'

export function CharacterList({
  game,
  characters,
}: {
  game: Game
  characters: CharacterInfo[]
}) {
  const onClose = (character: CharacterInfo) => {
    Swal.fire({
      text: 'Are you sure?',
      showConfirmButton: true,
      confirmButtonText: 'Yes',
      showDenyButton: true,
      denyButtonText: 'No',
    }).then((r) => r.isConfirmed && character.remove())
  }

  return (
    <div className="fixed bottom-0 bg-white w-full text-black flex flex-row gap-4 p-4">
      {characters.map((character) => (
        <CharacterCard
          character={character}
          key={character.id}
          onClose={() => onClose(character)}
        ></CharacterCard>
      ))}
      <NewCharacterCard game={game}></NewCharacterCard>
    </div>
  )
}
