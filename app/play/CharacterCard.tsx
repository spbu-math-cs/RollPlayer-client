import { CharacterInfo } from '@/engine/entities/CharacterInfo'

export function CharacterCard({
  character,
  context,
}: {
  character: CharacterInfo
  context?: { x: number; y: number }
}) {
  return (
    <div
      style={
        context && {
          position: 'absolute',
          left: context.x + 24,
          top: context.y + 24,
          pointerEvents: 'none',
          opacity: 0.8,
        }
      }
      className="bg-white text-black rounded-xl p-6 shadow-xl relative"
    >
      {!context && (
        <button
          className="top-2 right-2 absolute"
          onClick={() => character.remove()}
        >
          🗑️
        </button>
      )}
      Character {character.username}
    </div>
  )
}
