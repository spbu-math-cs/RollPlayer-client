import { BoardApi } from '../api/BoardApi'
import { Viewport } from 'pixi-viewport'
import { Connection } from '../api/Connection'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'
import { BoardInfo } from './BoardInfo'

export class Game {
  connection: Connection
  app: PIXI.Application
  boardApi: BoardApi

  constructor(gameId: string, canvas: HTMLCanvasElement, public readonly window: Window) {
    this.connection = new Connection(gameId)

    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.boardApi = new BoardApi()

    this.boardApi.getBoard().then(this.loadBoard.bind(this))
  }

  loadBoard(info: BoardInfo) {
    const board = new Board(this.app, info, this.window)

    this.connection.on('player:new', (info) => board.addPlayer(info))
    this.connection.on('player:leave', (id) => board.removePlayer(id))

    this.app.stage.addChild(board)
  }
}
