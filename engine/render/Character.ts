import { CharacterInfo } from '../entities/CharacterInfo'
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Board } from './Board'
import { Tile } from './Tile'
import { CELL_WIDTH, CELL_HEIGHT, CELL_SCALE } from '../GlobalParameters'
import { COMMON_TINT, HIGHLIGHT_TINT } from '../GlobalParameters'

const ACTUAL_CELL_WIDTH = CELL_WIDTH * CELL_SCALE
const ACTUAL_CELL_HEIGHT = CELL_HEIGHT * CELL_SCALE

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

function getCol(id: number, min: number, max: number) {
  id += 1
  const rn = (Math.sin((2 * id * id + 3 * id + 5) * 1000000) + 1) / 2
  return Math.floor(rn * (max - min)) + min
}

export class Character extends PIXI.Graphics {
  private nearestTile: Tile | null = null
  private tween: TWEEN.Tween<{ x: number; y: number }> | null = null

  constructor(
    private board: Board,
    public readonly info: CharacterInfo,
  ) {
    super()

    const character_color = getCol(info.id * 2, 0xc0c0c0, 0xffffff + 1)
    const outline_color = getCol(info.id * 2 + 1, 0xc0c0c0, 0xffffff + 1)
    this.lineStyle(2, outline_color, 1)
    this.beginFill(character_color, 1)
    this.drawCircle(0, 0, Math.min(ACTUAL_CELL_WIDTH, ACTUAL_CELL_HEIGHT) / 3)
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
    this.moveAnimated(row, col, TWEEN.Easing.Exponential.InOut)
  }

  private onReset() {
    this.moveAnimated(this.info.row, this.info.col, TWEEN.Easing.Elastic.Out)
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
    timeout = 1000,
  ) {
    const target_x = col * ACTUAL_CELL_WIDTH + ACTUAL_CELL_WIDTH / 2
    const target_y = row * ACTUAL_CELL_HEIGHT + ACTUAL_CELL_HEIGHT / 2

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
