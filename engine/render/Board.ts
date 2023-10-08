import { Application } from 'pixi.js'
import * as PIXI from 'pixi.js'

import { Tile } from './Tile'
import { BoardInfo } from '../entities/BoardInfo'
import { PlayerInfo } from '../entities/PlayerInfo'
import { Player } from './Player'

const CELL_SIZE = 16
const SCALE = 4

const BOARD_WIDTH = 16
const BOARD_HEIGHT = 12

const COMMON_TINT = 0xb0b0b0
const HIGHLIGHT_TINT = 0xffffff

export class Board extends PIXI.Container {
  public readonly tiles: Tile[][] = []
  public readonly players: Map<number, Player> = new Map()
  private activePlayer: Player | null = null

  constructor(public readonly app: PIXI.Application) {
    super()

    this.interactive = true

    window.addEventListener('blur', this.deactivatePlayer.bind(this))
    this.on('pointerup', this.finishPlayerMove.bind(this))
    this.on('pointermove', this.dragPlayer.bind(this))

    this.app.ticker.add(() => {
      this.sortableChildren = true

      this.x = this.app.screen.width / 2
      this.y = this.app.screen.height / 2

      this.pivot.x = this.width / 2
      this.pivot.y = this.height / 2
    })
  }

  activatePlayer(player: Player) {
    this.deactivatePlayer()

    this.activePlayer = player
    player.activate()
  }

  dragPlayer(e: PIXI.FederatedPointerEvent) {
    if (this.activePlayer === null) return
    const pos = this.toLocal(e.global, void 0)
    this.activePlayer.drag(pos.x, pos.y)
  }

  deactivatePlayer() {
    this.activePlayer?.deactivate()
    this.activePlayer = null
  }

  finishPlayerMove() {
    if (!this.activePlayer) return

    this.activePlayer.finishMove()
    this.deactivatePlayer()
  }

  getNearestTile(x: number, y: number): Tile {
    let row = Math.round((y / SCALE - CELL_SIZE / 2) / CELL_SIZE)
    row = Math.max(0, row)
    row = Math.min(BOARD_HEIGHT - 1, row)

    let col = Math.round((x / SCALE - CELL_SIZE / 2) / CELL_SIZE)
    col = Math.max(0, col)
    col = Math.min(BOARD_WIDTH - 1, col)

    return this.tiles[row][col]
  }

  calculateTilePosition(row: number, col: number) {
    const target_x = (col * CELL_SIZE + CELL_SIZE / 2) * SCALE
    const target_y = (row * CELL_SIZE + CELL_SIZE / 2) * SCALE
    return [target_x, target_y]
  }

  fill(info: BoardInfo) {
    if (this.tiles.length > 0)
      throw new Error('Trying to recreate the board without clearing it')

    for (let i = 0; i < info.rows; i++) {
      this.tiles[i] = []

      for (let j = 0; j < info.cols; j++) {
        const tile = new Tile(this, info.tiles[i][j])

        this.addChild(tile)

        this.tiles[i][j] = tile
      }
    }
  }

  addPlayer(info: PlayerInfo) {
    const player = new Player(this, info)

    player.on('pointerdown', () => this.activatePlayer(player))

    this.addChild(player)
    this.players.set(info.id, player)
  }

  removePlayer(info: PlayerInfo) {
    const player = this.players.get(info.id)
    if (!player) return

    this.removeChild(player)
    this.players.delete(info.id)
  }
}
