import * as PIXI from 'pixi.js'
import { Tile } from './Tile'
import { BoardInfo } from '../entities/BoardInfo'
import { CharacterInfo } from '../entities/CharacterInfo'
import { Character } from './Character'
import { Viewport } from 'pixi-viewport'
import { CELL_WIDTH, CELL_HEIGHT, CELL_SCALE } from '../GlobalParameters'

const ACTUAL_CELL_WIDTH = CELL_WIDTH * CELL_SCALE
const ACTUAL_CELL_HEIGHT = CELL_HEIGHT * CELL_SCALE

export class Board extends Viewport {
  public readonly tiles: Tile[][] = []
  public readonly characters: Map<number, Character> = new Map()
  private activeCharacter: Character | null = null

  constructor(
    public readonly app: PIXI.Application,
    public readonly info: BoardInfo,
    public readonly window: Window,
  ) {
    super({
      events: app.renderer.events,
      disableOnContextMenu: true,
      worldWidth: info.cols * ACTUAL_CELL_WIDTH,
      worldHeight: info.rows * ACTUAL_CELL_HEIGHT,
    })

    this.x = this.screenWidth / 2 - this.worldWidth / 2
    this.y = this.screenHeight / 2 - this.worldHeight / 2

    this.drag({ mouseButtons: 'right' })
      .pinch()
      .wheel({ smooth: 5 })
      .decelerate({ friction: 0.9 })

    this.window.addEventListener('blur', () => this.deactivateCharacter())
    this.on('pointerup', this.finishCharacterMove.bind(this))
    this.on('pointermove', this.dragCharacter.bind(this))

    this.sortableChildren = true

    this.initBoard()
  }

  activateCharacter(character: Character) {
    this.deactivateCharacter()

    this.activeCharacter = character
    character.activate()
  }

  dragCharacter(e: PIXI.FederatedPointerEvent) {
    if (this.activeCharacter === null) return

    const pos = this.toLocal(e.global, void 0)
    this.activeCharacter.drag(pos.x, pos.y)
    this.emit('context:character', null)
  }

  deactivateCharacter(moveBack = true) {
    this.activeCharacter?.deactivate(moveBack)
    this.activeCharacter = null
  }

  finishCharacterMove() {
    if (!this.activeCharacter) return

    this.activeCharacter.finishMove()
    this.deactivateCharacter(false)
  }

  getNearestTile(x: number, y: number): Tile {
    let row = Math.round((y - ACTUAL_CELL_HEIGHT / 2) / ACTUAL_CELL_HEIGHT)
    row = Math.max(0, row)
    row = Math.min(this.info.rows - 1, row)

    let col = Math.round((x - ACTUAL_CELL_WIDTH / 2) / ACTUAL_CELL_WIDTH)
    col = Math.max(0, col)
    col = Math.min(this.info.cols - 1, col)

    return this.tiles[row][col]
  }

  calculateTilePosition(row: number, col: number) {
    const target_x = col * ACTUAL_CELL_WIDTH + ACTUAL_CELL_WIDTH / 2
    const target_y = row * ACTUAL_CELL_HEIGHT + ACTUAL_CELL_HEIGHT / 2

    return [target_x, target_y]
  }

  initBoard() {
    if (this.tiles.length > 0)
      throw new Error('Trying to recreate the board without clearing it')

    for (let i = 0; i < this.info.rows; i++) {
      this.tiles[i] = []

      for (let j = 0; j < this.info.cols; j++) {
        const tile = new Tile(this, this.info.tiles[i][j])

        this.addChild(tile)

        this.tiles[i][j] = tile
      }
    }
  }

  addCharacter(info: CharacterInfo) {
    const character = new Character(this, info)

    if (character.info.own)
      character.on('pointerdown', (e) => {
        if (e.button !== 0) return
        this.activateCharacter(character)
      })

    character.on('pointerenter', () => {
      if (this.activeCharacter) return
      this.emit('context:character', {
        character: character.info,
        x: character.getGlobalPosition().x,
        y: character.getGlobalPosition().y,
      })
    })

    character.on('pointerleave', () => this.emit('context:character', null))

    this.addChild(character)
    this.characters.set(info.id, character)
  }

  removeCharacter(info: CharacterInfo) {
    const character = this.characters.get(info.id)
    if (!character) return

    this.removeChild(character)
    this.characters.delete(info.id)
  }
}
