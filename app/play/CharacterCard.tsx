import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { useEffect, useState } from 'react';

export function CharacterCard({
  character,
  position,
  onClose = () => { },
  attackButtons,
  children,
}: {
  character: CharacterInfo
  position?: { x: number; y: number }
  onClose?: () => void
  attackButtons?: React.ReactNode
  children?: React.ReactNode
}) {
  const [_, rerender] = useState()

  useEffect(() => {
    character.on('attack', rerender)
    character.on('attacked', rerender)
    character.on('status', rerender)

    return () => {
      character.off('attack', rerender)
      character.off('attacked', rerender)
      character.off('status', rerender)
    }
  }, [character])


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
      <span className="block text-xl">Character {character.name} plss</span>
      {attackButtons}
      <ul>&nbsp;</ul>
      <ul
        className={`overflow-y-auto block box-border ${!position && ' h-0 min-h-[90%] '
          }`}
      >
        {
          [...character.properties].map(
            (property) => (
              <li key={property.name}>
                {property.name}: {property.value}
              </li>
            ),
          ).concat(
            [
              <li key={'delimeter'}>
                &nbsp;
              </li>
            ]
          ).concat(
            [...character.basicProperties].map(
              (property) => (
                <li key={property.name}>
                  <i>{property.name}: {property.value}</i>
                </li>
              ),
            )
          )
        }
      </ul>
      {children}
    </div>
  )
}
