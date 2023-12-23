import * as PIXI from 'pixi.js'
import { Tile } from './Tile'
import { BoardInfo } from '../entities/BoardInfo'
import { CharacterInfo } from '../entities/CharacterInfo'
import { Character } from './Character'
import { Viewport } from '../pixi-viewport-fork/src'

//! VERY UNSAFE
export class Board extends (Viewport as unknown as typeof import('pixi-viewport').Viewport) {
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
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: info.cols * info.tileWidth,
      worldHeight: info.rows * info.tileHeight,
    })

    this.x = (this.screenWidth - this.worldWidth) / 2
    this.y = (this.screenHeight - this.worldHeight) / 2

    this.drag({ mouseButtons: 'right', /* keyToPress: ['ShiftLeft'] */ })
      .pinch()
      .wheel({ smooth: 5 })
      .decelerate({ friction: 0.9 })

    this.window.addEventListener('blur', () => this.deactivateCharacter())
    this.on('pointerup', this.finishCharacterMove.bind(this))
    this.on('pointermove', this.dragCharacter.bind(this))
    this.on(
      'pointerdown',
      (e) => e.button === 0 && this.emit('context:character', null),
    )

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
    let row = Math.round((y - this.info.tileHeight / 2) / this.info.tileHeight)
    row = Math.max(0, row)
    row = Math.min(this.info.rows - 1, row)

    let col = Math.round((x - this.info.tileWidth / 2) / this.info.tileWidth)
    col = Math.max(0, col)
    col = Math.min(this.info.cols - 1, col)

    return this.tiles[row][col]
  }

  calculateTilePosition(row: number, col: number) {
    const target_x = col * this.info.tileWidth + this.info.tileWidth / 2
    const target_y = row * this.info.tileHeight + this.info.tileHeight / 2

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

    character.on('pointerdown', (e) => {
      switch (e.button) {
        case 0:
          if (character.info.own)
            this.activateCharacter(character)
          break
        case 2:
          this.emit('context:character', {
            character: character.info,
            x: character.getGlobalPosition().x,
            y: character.getGlobalPosition().y,
          })
          break
      }
    })

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
