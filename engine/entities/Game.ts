import { BoardApi } from '../api/BoardApi'
import { Viewport } from 'pixi-viewport'
import { Connection } from '../api/Connection'
import { Background } from '../render/Background'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'
import { BoardInfo } from './BoardInfo'

export class Game {
  connection: Connection
  app: PIXI.Application
  boardApi: BoardApi

  constructor(
    gameId: string,
    canvas: HTMLCanvasElement,
    public readonly window: Window
  ) {
    this.connection = new Connection(gameId)

    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.loadBackground()

    this.boardApi = new BoardApi()

    this.boardApi.getBoard().then(this.loadBoard.bind(this))
  }

  loadBackground() {
    const background = new Background(this.app)

    this.app.stage.addChild(background)
  }

  loadBoard(info: BoardInfo) {
    const board = new Board(this.app, info, this.window)

    this.connection.on('character:new', (info) => board.addCharacter(info))
    this.connection.on('character:leave', (id) => board.removeCharacter(id))

    this.app.stage.addChild(board)
  }
}
