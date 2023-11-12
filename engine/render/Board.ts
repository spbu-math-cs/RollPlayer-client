import * as PIXI from 'pixi.js'
import { Tile } from './Tile'
import { BoardInfo } from '../entities/BoardInfo'
import { PlayerInfo } from '../entities/PlayerInfo'
import { Player } from './Player'
import { Viewport } from 'pixi-viewport'
import { CELL_WIDTH, CELL_HEIGHT, CELL_SCALE } from '../GlobalParameters'

const ACTUAL_CELL_WIDTH = CELL_WIDTH * CELL_SCALE
const ACTUAL_CELL_HEIGHT = CELL_HEIGHT * CELL_SCALE

export class Board extends Viewport {
  public readonly tiles: Tile[][] = []
  public readonly players: Map<number, Player> = new Map()
  private activePlayer: Player | null = null

  constructor(
    public readonly app: PIXI.Application,
    public readonly info: BoardInfo,
    public readonly window: Window,
  ) {
    super({
      events: app.renderer.events,
      disableOnContextMenu: true,
      worldWidth: info.cols * ACTUAL_CELL_WIDTH,
      worldHeight: info.rows * ACTUAL_CELL_HEIGHT,
    })

    this.x = this.screenWidth / 2 - this.worldWidth / 2
    this.y = this.screenHeight / 2 - this.worldHeight / 2

    this.drag({ mouseButtons: 'right' })
      .pinch()
      .wheel({smooth: 5})
      .decelerate({ friction: 0.9 })

    this.window.addEventListener('blur', this.deactivatePlayer.bind(this))
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
    let row = Math.round((y - ACTUAL_CELL_HEIGHT / 2) / ACTUAL_CELL_HEIGHT)
    row = Math.max(0, row)
    row = Math.min(this.info.rows - 1, row)

    let col = Math.round((x - ACTUAL_CELL_WIDTH / 2) / ACTUAL_CELL_WIDTH)
    col = Math.max(0, col)
    col = Math.min(this.info.cols - 1, col)

    return this.tiles[row][col]
  }

  calculateTilePosition(row: number, col: number) {
    const target_x = col * ACTUAL_CELL_WIDTH + ACTUAL_CELL_WIDTH / 2
    const target_y = row * ACTUAL_CELL_HEIGHT + ACTUAL_CELL_HEIGHT / 2

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
