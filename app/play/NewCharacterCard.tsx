import { Game } from '@/engine/entities/Game'
import { useState } from 'react'

export function NewCharacterCard({ game }: { game: Game }) {
  const [newUsername, setNewUsername] = useState('')
  const addCharacter = () => {
    game.connection.createCharacter(newUsername)
  }

  return (
    <div className="bg-white text-black rounded-xl p-2 shadow-xl relative flex flex-col items-stretch">
      <input
        type="text"
        name="username"
        placeholder="Username"
        className="block p-2 m-2"
        value={newUsername}
        onInput={(e) => setNewUsername((e.target as HTMLInputElement).value)}
      />
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block m-2"
        onClick={addCharacter}
      >
        Add character
      </button>
    </div>
  )
}
