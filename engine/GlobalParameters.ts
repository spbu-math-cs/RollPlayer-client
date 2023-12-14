// export const BOARD_WIDTH = 17
// export const BOARD_HEIGHT = 11

// export const CELL_WIDTH = 40   // in pixels
// export const CELL_HEIGHT = 40  // in pixels

// export const CELL_SCALE = 4
export const ACTIVATED_CELL_SCALE = 1.5

export const COMMON_TINT = 0xb0b0b0
export const HIGHLIGHT_TINT = 0xffffff

export const BACKGROUND_SCALE = 1.35

export const CHARACTER_Z_INDEX = 1_000_000_000

export const BASIC_PROPERTIES = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const

export type BasicProperties = Readonly<
  Record<(typeof BASIC_PROPERTIES)[number], number>
>

export const ATTACK_TYPES = ['melee', 'ranged', 'magic'] as const
export type AttackType = typeof ATTACK_TYPES[number]
export const ATTACK_NAMES = {
  melee: 'Melee',
  ranged: 'Ranged',
  magic: 'Magic',
} as Record<AttackType, string>

export const POINTS_RANGE = [6, 8]

export const BASIC_PROPERTY_NAMES = Object.seal({
  charisma: 'Charisma',
  constitution: 'Constitution',
  dexterity: 'Dexterity',
  intelligence: 'Intelligence',
  strength: 'Strength',
  wisdom: 'Wisdom',
}) as Readonly<Record<(typeof BASIC_PROPERTIES)[number], string>>

export const ERROR_TEXT = {
  not_your_turn: "Not Your Turn",
  is_defeated: "Is Defeated",
  big_dist: "Big Dist",
  tile_obstacle: "Tile Obstacle",
  low_mana: "Low Mana",
  opponent_is_defeated: "Opponent Is Defeated",
  is_not_defeated: "Is Not Defeated",
}
