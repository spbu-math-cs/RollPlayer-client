import {
  BASIC_PROPERTIES,
  BASIC_PROPERTY_NAMES,
  BasicProperties,
  POINTS_RANGE,
} from '@/engine/GlobalParameters'
import { Game } from '@/engine/entities/Game'
import { useState } from 'react'

function PointsSelector({
  range: [rangeMin, rangeMax],
  onValueUpdate = () => {},
}: {
  range: [number, number]
  onValueUpdate?: (n: number) => void
}) {
  const [value, setValue] = useState(0)

  const updateValue = (direction: number) => {
    if (Math.abs(direction) > 1) return

    if (value + direction >= rangeMin && value + direction <= rangeMax) {
      setValue(value + direction)
      onValueUpdate(value + direction)
    }
  }

  return (
    <>
      <button
        className="bg-red-500 p-1 disabled:bg-red-300 rounded-lg leading-3 m-1"
        disabled={value <= rangeMin}
        onClick={() => updateValue(-1)}
      >
        -
      </button>
      <span>{value}</span>
      <button
        className="bg-green-500 p-1 disabled:bg-green-300 rounded-lg leading-3 m-1"
        disabled={value >= rangeMax}
        onClick={() => updateValue(+1)}
      >
        +
      </button>
    </>
  )
}

export function NewCharacterCard({ game }: { game: Game }) {
  const [newCharacterName, setNewCharacterName] = useState('')

  const [basicProperties, setBasicProperties] = useState(
    Object.fromEntries(
      BASIC_PROPERTIES.map((key) => [key, 0]),
    ) as BasicProperties,
  )

  const addCharacter = () => {
    const board = game.board
    if (board === undefined) {
      console.error('Trying to create character without board initialized')
      return
    }

    const tile = board.consumeSelectedTile()
    if (tile === undefined) {
      console.error('Trying to create character without tile selected')
      return
    }

    const [row, col] = tile
    game.connection.createCharacter(newCharacterName, basicProperties, row, col)
  }

  const sum = Object.values(basicProperties).reduce((a, b) => a + b, 0)

  const [pointsToMin, pointsToMax] = POINTS_RANGE.map((x) => x - sum)

  let text = <div></div>
  switch (true) {
    case pointsToMin > 0:
      text = (
        <div>
          You need to add <b>{pointsToMin}</b> more points
        </div>
      )
      break
    case pointsToMax > 0:
      text = (
        <div>
          You can add <b>{pointsToMax}</b> more points
        </div>
      )
      break
    case pointsToMax < 0:
      text = (
        <div>
          You need to remove <b>{-pointsToMax}</b> points
        </div>
      )
      break
  }

  const content = Object.entries(BASIC_PROPERTY_NAMES).map(([key, name]) => (
    <li key={key}>
      Property: {name}
      <PointsSelector
        range={[-4, 4]}
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
        name="characterName"
        placeholder="Character Name"
        className="block p-2 m-2"
        value={newCharacterName}
        onInput={(e) => setNewCharacterName((e.target as HTMLInputElement).value)}
      />
      {text}
      {content}
      <button
        className="bg-green-500 disabled:bg-green-300 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block m-2"
        disabled={pointsToMin > 0 || pointsToMax < 0}
        onClick={addCharacter}
      >
        Add Character
      </button>
    </div>
  )
}
