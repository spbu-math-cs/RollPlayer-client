import { BoardApi } from '../api/BoardApi'
import { Connection } from '../api/Connection'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'

export class Game {
  connection: Connection
  board: Board
  app: PIXI.Application
  boardApi: BoardApi

  constructor(gameId: string, canvas: HTMLCanvasElement) {
    this.connection = new Connection(gameId)

    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.boardApi = new BoardApi()

    this.boardApi.getBoard().then((info) => this.board.fill(info))

    this.board = new Board(this.app)
    this.app.stage.addChild(this.board)
    
    this.connection.on('player:new', (info) => this.board.addPlayer(info))
    this.connection.on('player:leave', (id) => this.board.removePlayer(id))
  }
}
