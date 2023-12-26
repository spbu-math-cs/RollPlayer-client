
export const ACTIVATED_TILE_SCALE = 1.5

export const COMMON_TINT = 0xb0b0b0
export const HIGHLIGHTED_TILE_TINT = 0xffffff

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
  not_your_turn: 'Not your turn yet!',
  is_defeated: 'You are defeated!',
  big_dist: 'Too big distance!',
  tile_obstacle: 'Can\'t move/spawn! That is an obstacle tile!',
  low_mana: 'You have too little mana!',
  opponent_is_defeated: 'The opponent is defeated!',
  is_not_defeated: 'You are not defeated!',
}
