import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { useState } from 'react';
import Swal from 'sweetalert2'

export function CharacterCard({
  character,
  position,
  onClose = () => { },
  children,
}: {
  character: CharacterInfo
  position?: { x: number; y: number }
  onClose?: () => void
  children?: React.ReactNode
}) {
  const [_, rerender] = useState()

  character.on('attack', rerender)
  character.on('attacked', rerender)
  character.on('status', rerender)

  return (
    <div
      style={
        position && {
          position: 'absolute',
          left: position.x + 24,
          top: position.y + 24,
          opacity: 0.8,
        }
      }
      className="bg-white text-black rounded-xl p-6 shadow-xl relative"
    >
      {
        <button className="top-2 right-2 absolute" onClick={onClose}>
          X
        </button>
      }
      <span className="block text-xl">Character {character.username} plss</span>
      <ul
        className={`overflow-y-auto block box-border ${!position && ' h-0 min-h-[90%] '
          }`}
      >
        {[...character.basicProperties, ...character.properties].map(
          (property) => (
            <li key={property.name}>
              {property.name}: {property.value}
            </li>
          ),
        )}
      </ul>
      {children}
    </div>
  )
}
