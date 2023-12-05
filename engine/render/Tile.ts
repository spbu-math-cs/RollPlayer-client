import * as PIXI from 'pixi.js'
import { Board } from './Board'
import { TileInfo } from '../entities/TileInfo'
import { ACTIVATED_CELL_SCALE } from '../GlobalParameters'
import { COMMON_TINT, HIGHLIGHT_TINT } from '../GlobalParameters'

export class Tile extends PIXI.Sprite {
  constructor(
    private readonly board: Board,
    public readonly info: TileInfo,
  ) {
    super()

    this.texture = info.texture
    this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    this.anchor.set(0.5)
    this.width = this.board.info.tileWidth
    this.height = this.board.info.tileHeight
    this.tint = COMMON_TINT

    this.position.set(...this.board.calculateTilePosition(info.row, info.col))
  }

  activate() {
    this.scale.set(ACTIVATED_CELL_SCALE)
    this.tint = HIGHLIGHT_TINT
    this.zIndex = this.board.info.rows * this.board.info.cols
  }

  deactivate() {
    this.scale.set(1.0)
    this.tint = COMMON_TINT
    this.zIndex = 0
  }
}
