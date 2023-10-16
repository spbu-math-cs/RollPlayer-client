import { PlayerInfo } from '../entities/PlayerInfo'
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Board } from './Board'
import { Tile } from './Tile'

const CELL_SIZE = 16
const SCALE = 4

const COMMON_TINT = 0xb0b0b0
const HIGHLIGHT_TINT = 0xffffff

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export class Player extends PIXI.Graphics {
  private nearestTile: Tile | null = null
  private tween: TWEEN.Tween<{ x: number; y: number }> | null = null
  private update: (() => void) | null = null
  private active = false

  constructor(
    private board: Board,
    public readonly info: PlayerInfo,
  ) {
    super()

    const player_color = getRandomInteger(0xc0c0c0, 0xffffff + 1)
    const outline_color = getRandomInteger(0xc0c0c0, 0xffffff + 1)
    this.lineStyle(2, outline_color, 1)
    this.beginFill(player_color, 1)
    this.drawCircle(0, 0, (CELL_SIZE / 3) * SCALE)
    this.endFill()

    this.interactive = true
    this.cursor = 'pointer'

    this.info.on('move', this.onMove.bind(this))
    this.info.on('reset', this.onReset.bind(this))

    this.moveAnimated(info.row, info.col)

    this.board.app.ticker.add(this.updateTween.bind(this))

    this.zIndex = Infinity
  }

  private onMove({ row, col }: { row: number; col: number }) {
    this.moveAnimated(row, col, TWEEN.Easing.Elastic.Out)
  }

  private onReset() {
    this.moveAnimated(this.info.row, this.info.col, TWEEN.Easing.Elastic.Out)
  }

  public activate() {
    this.tween?.stop()

    this.active = true
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
    this.active = false
    this.alpha = 1
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
    timeout = 1500,
  ) {
    const target_x = (col * CELL_SIZE + CELL_SIZE / 2) * SCALE
    const target_y = (row * CELL_SIZE + CELL_SIZE / 2) * SCALE

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
