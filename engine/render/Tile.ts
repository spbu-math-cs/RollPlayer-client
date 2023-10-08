import * as PIXI from 'pixi.js'
import { Board } from './Board'
import { TileInfo } from '../entities/TileInfo'

const CELL_SIZE = 16
const SCALE = 4

const BOARD_WIDTH = 16
const BOARD_HEIGHT = 12

const COMMON_TINT = 0xb0b0b0
const HIGHLIGHT_TINT = 0xffffff

export class Tile extends PIXI.Sprite {
  constructor(
    private readonly board: Board,
    public readonly info: TileInfo,
  ) {
    super()

    this.texture = PIXI.Texture.from(info.texture)
    this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    this.anchor.set(0.5)
    this.scale.set(SCALE)
    this.tint = COMMON_TINT

    this.position.set(...this.board.calculateTilePosition(info.row, info.col))
  }

  activate() {
    this.scale.set(SCALE * 1.2)
    this.tint = HIGHLIGHT_TINT
    this.zIndex = BOARD_WIDTH * BOARD_HEIGHT
  }

  deactivate() {
    this.scale.set(SCALE)
    this.tint = COMMON_TINT
    this.zIndex = 0
  }
}
