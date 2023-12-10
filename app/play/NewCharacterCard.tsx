import {
  BASIC_PROPERTIES,
  BASIC_PROPERTY_NAMES,
  BasicProperties,
} from '@/engine/GlobalParameters'
import { Game } from '@/engine/entities/Game'
import { useState } from 'react'

function PointsSelector({
  addingEnabled = true,
  onValueUpdate = () => {},
}: {
  addingEnabled?: boolean
  onValueUpdate?: (n: number) => void
}) {
  const [value, setValue] = useState(0)

  const updateValue = (direction: number) => {
    if (Math.abs(direction) > 1) return

    if (value + direction >= 0) {
      setValue(value + direction)
      onValueUpdate(value + direction)
    }
  }

  return (
    <>
      <button
        className="bg-red-500 p-1 disabled:bg-red-300 rounded-lg leading-3 m-1"
        disabled={value <= 0}
        onClick={() => updateValue(-1)}
      >
        -
      </button>
      <span>{value}</span>
      <button
        className="bg-green-500 p-1 disabled:bg-green-300 rounded-lg leading-3 m-1"
        disabled={!addingEnabled}
        onClick={() => updateValue(+1)}
      >
        +
      </button>
    </>
  )
}

export function NewCharacterCard({ game }: { game: Game }) {
  const [newUsername, setNewUsername] = useState('')

  const [basicProperties, setBasicProperties] = useState(
    Object.fromEntries(
      BASIC_PROPERTIES.map((key) => [key, 0]),
    ) as BasicProperties,
  )

  const addCharacter = () => {
    game.connection.createCharacter(newUsername, basicProperties)
  }

  const sum = Object.values(basicProperties).reduce((a, b) => a + b, 0)

  const content = Object.entries(BASIC_PROPERTY_NAMES).map(([key, name]) => (
    <li key={key}>
      Property: {name}
      <PointsSelector
        addingEnabled={sum < 6}
        onValueUpdate={(v) =>
          setBasicProperties({ ...basicProperties, [key]: v })
        }
      ></PointsSelector>
    </li>
  ))

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
      {content}
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block m-2"
        onClick={addCharacter}
      >
        Add character
      </button>
    </div>
  )
}
