import * as PIXI from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import { Board } from './Board'
import { TileInfo } from '../entities/TileInfo'
import { ACTIVATED_CELL_SCALE } from '../GlobalParameters'
import { COMMON_TINT, HIGHLIGHT_TINT } from '../GlobalParameters'

export class Tile extends PIXI.Sprite {
  private readonly defaultFilters = []
  private readonly activatedOnSelectFilters = [new GlowFilter({
    distance: 10,
    outerStrength: 4,
    innerStrength: 4,
    color: 0xff0000,
  })]

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
    this.zIndex = 0

    this.position.set(...this.board.calculateTilePosition(info.row, info.col))

    this.eventMode = 'static'
    this.on('mousedown', this.onTouch)
  }

  onTouch() {
    this.board.selectTile(this.info.row, this.info.col)
  }

  activateOnSelect() {
    this.scale.set(ACTIVATED_CELL_SCALE)
    this.tint = HIGHLIGHT_TINT
    this.zIndex = this.board.info.rows * this.board.info.cols
    this.filters = this.activatedOnSelectFilters
  }

  deactivateOnSelect() {
    this.scale.set(1.0)
    this.tint = COMMON_TINT
    this.zIndex = 0
    this.filters = this.defaultFilters
  }

  activateOnCharacterDrag() {
    this.scale.set(ACTIVATED_CELL_SCALE)
    this.tint = HIGHLIGHT_TINT
    this.zIndex = this.board.info.rows * this.board.info.cols
  }

  deactivateOnCharacterDrag() {
    this.scale.set(1.0)
    this.tint = COMMON_TINT
    this.zIndex = 0
  }
}
