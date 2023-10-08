import { Application } from 'pixi.js'
import * as PIXI from 'pixi.js'

import { Tile } from './Tile'
import { BoardInfo } from '../entities/BoardInfo'
import { PlayerInfo } from '../entities/PlayerInfo'
import { Player } from './Player'
import { Viewport } from 'pixi-viewport'

const CELL_SIZE = 64

export class Board extends Viewport {
  public readonly tiles: Tile[][] = []
  public readonly players: Map<number, Player> = new Map()
  private activePlayer: Player | null = null

  constructor(
    public readonly app: PIXI.Application,
    public readonly info: BoardInfo,
  ) {
    super({
      events: app.renderer.events,
      disableOnContextMenu: true,
      worldWidth: info.cols * CELL_SIZE,
      worldHeight: info.rows * CELL_SIZE,
    })

    this.x = this.screenWidth / 2 - this.worldWidth / 2
    this.y = this.screenHeight / 2 - this.worldHeight / 2

    this.drag({ mouseButtons: 'right' })
      .pinch()
      .wheel({smooth: 5})
      .decelerate({ friction: 0.9 })

    window.addEventListener('blur', this.deactivatePlayer.bind(this))
    this.on('pointerup', this.finishPlayerMove.bind(this))
    this.on('pointermove', this.dragPlayer.bind(this))

    this.sortableChildren = true

    this.initBoard()
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
    let row = Math.round((y - CELL_SIZE / 2) / CELL_SIZE)
    row = Math.max(0, row)
    row = Math.min(this.info.rows, row)

    let col = Math.round((x - CELL_SIZE / 2) / CELL_SIZE)
    col = Math.max(0, col)
    col = Math.min(this.info.cols, col)

    return this.tiles[row][col]
  }

  calculateTilePosition(row: number, col: number) {
    const target_x = col * CELL_SIZE + CELL_SIZE / 2
    const target_y = row * CELL_SIZE + CELL_SIZE / 2
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

  addPlayer(info: PlayerInfo) {
    const player = new Player(this, info)

    if (player.info.own)
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
