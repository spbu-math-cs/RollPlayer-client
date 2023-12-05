import { CharacterInfo } from '../entities/CharacterInfo'
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Board } from './Board'
import { Tile } from './Tile'
import { CELL_WIDTH, CELL_HEIGHT, CELL_SCALE } from '../GlobalParameters'
import { COMMON_TINT, HIGHLIGHT_TINT } from '../GlobalParameters'
import { GlowFilter } from '@pixi/filter-glow'

//const ACTUAL_CELL_WIDTH = CELL_WIDTH * CELL_SCALE
//const ACTUAL_CELL_HEIGHT = CELL_HEIGHT * CELL_SCALE

function getCol(id: number, min: number, max: number) {
  id += 1

  const r = min + id * 998_244_353 % (max - min + 1)
  const g = min + id * 805_306_457 % (max - min + 1)
  const b = min + id * 1_000_000_007 % (max - min + 1)

  return r * 256 * 256 + g * 256 + b
}

export class Character extends PIXI.Graphics {
  private nearestTile: Tile | null = null
  private tween: TWEEN.Tween<{ x: number; y: number }> | null = null

  private defaultFilters = []
  private highlightFilters = [new GlowFilter({ distance: 20, outerStrength: 2 })]

  constructor(
    private board: Board,
    public readonly info: CharacterInfo,
  ) {
    super()

    const outline_color = this.info.own ? 0xff0000 : 0xffffff
    this.lineStyle(5, outline_color, 1)

    const character_color = getCol(info.id, 0x40, 0xff)
    this.beginFill(character_color, 1)
    this.drawCircle(0, 0, Math.min(this.board.info.tileWidth, this.board.info.tileHeight) / 3 * CELL_SCALE)
    this.endFill()

    this.interactive = true
    this.cursor = 'pointer'

    this.info.on('move', this.onMove.bind(this))
    this.info.on('reset', this.onReset.bind(this))
    this.info.on('status', this.onStatusUpdate.bind(this))

    this.moveAnimated(info.row, info.col)

    this.board.app.ticker.add(this.updateTween.bind(this))

    this.zIndex = Infinity

    this.filters = this.defaultFilters
  }

  private onMove({ row, col }: { row: number; col: number }) {
    this.moveAnimated(row, col, TWEEN.Easing.Linear.None, 200)
  }

  private onReset() {
    this.moveAnimated(this.info.row, this.info.col)
  }

  private onStatusUpdate(hightlight: boolean) {
    if (hightlight) {
      this.filters = this.highlightFilters
    } else {
      this.filters = this.defaultFilters
    }
  }

  public activate() {
    this.tween?.stop()

    this.alpha = 0.75
  }

  public drag(x: number, y: number) {
    this.nearestTile?.deactivate()
    this.x = x
    this.y = y
    this.nearestTile = this.board.getNearestTile(this.x, this.y)
    this.nearestTile.activate()
  }

  public finishMove() {
    const nearestTile = this.nearestTile
    if (!nearestTile) return

    this.info.move(nearestTile.info.row, nearestTile.info.col)
    this.deactivate(false)
  }

  public deactivate(moveBack = true) {
    this.alpha = 1.0
    this.nearestTile?.deactivate()
    this.nearestTile = null

    if (moveBack) this.moveAnimated(this.info.row, this.info.col)
  }

  private updateTween() {
    if (this.tween?.isPlaying()) this.tween.update()
  }

  private moveAnimated(
    row: number,
    col: number,
    easing: Parameters<InstanceType<typeof TWEEN.Tween>['easing']>[0] = void 0,
    timeout = 1000,
  ) {
    const target_x = (col * this.board.info.tileWidth + this.board.info.tileWidth / 2) * CELL_SCALE
    const target_y = (row * this.board.info.tileHeight + this.board.info.tileHeight / 2) * CELL_SCALE

    if (!easing) {
      this.x = target_x
      this.y = target_y
      return
    }

    const coords = { x: this.x, y: this.y }

    this.tween?.stop()

    this.tween = new TWEEN.Tween(coords, false)
      .to({ x: target_x, y: target_y }, timeout)
      .easing(easing)
      .onUpdate(() => {
        this.x = coords.x
        this.y = coords.y
      })
      .start()
  }
}
