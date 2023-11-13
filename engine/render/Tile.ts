import * as PIXI from 'pixi.js'
import { Board } from './Board'
import { TileInfo } from '../entities/TileInfo'

const COMMON_TINT = 0xb0b0b0
const HIGHLIGHT_TINT = 0xffffff

export class Tile extends PIXI.Sprite {
  private originalScale: number

  constructor(
    private readonly board: Board,
    public readonly info: TileInfo,
  ) {
    super()

    this.texture = info.texture
    this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    this.anchor.set(0.5)
    this.width = 64
    this.height = 64
    this.originalScale = this.scale.x
    this.tint = COMMON_TINT

    this.position.set(...this.board.calculateTilePosition(info.row, info.col))
  }

  activate() {
    this.scale.set(5)
    this.tint = HIGHLIGHT_TINT
    this.zIndex = this.board.info.rows * this.board.info.cols
  }

  deactivate() {
    this.scale.set(4)
    this.tint = COMMON_TINT
    this.zIndex = 0
  }
}
