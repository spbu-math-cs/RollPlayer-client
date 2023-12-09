import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import Swal from 'sweetalert2'

export function CharacterCard({
  character,
  context,
  onClose = () => {},
}: {
  character: CharacterInfo
  context?: { x: number; y: number }
  onClose?: () => void
}) {
  const onClickStatic = () => {
    Swal.fire({
      text: 'Are you sure?',
      showConfirmButton: true,
      confirmButtonText: 'Yes',
      showDenyButton: true,
      denyButtonText: 'No',
    }).then((r) => r.isConfirmed && character.remove())
  }
  const onClickContext = onClose
  const onClick = context ? onClickContext : onClickStatic

  return (
    <div
      style={
        context && {
          position: 'absolute',
          left: context.x + 24,
          top: context.y + 24,
          opacity: 0.8,
        }
      }
      className="bg-white text-black rounded-xl p-6 shadow-xl relative"
    >
      {
        <button className="top-2 right-2 absolute" onClick={onClick}>
          X
        </button>
      }
      <span className="block text-xl">Character {character.username}</span>
      <ul className="max-h-32 overflow-y-scroll">
        {[...character.basicProperties, ...character.properties].map(
          (property) => (
            <li key={property.name}>
              {property.name}: {property.value}
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
