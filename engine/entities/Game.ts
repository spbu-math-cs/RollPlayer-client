import { BoardApi } from '../api/BoardApi'
import { Viewport } from 'pixi-viewport'
import { Connection } from '../api/Connection'
import { Background } from '../render/Background'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'
import { BoardInfo } from './BoardInfo'

export class Game {
  connection?: Connection
  app: PIXI.Application
  boardApi: BoardApi

  constructor(
    private gameId: string,
    private canvas: HTMLCanvasElement,
    public readonly window: Window,
  ) {
    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.init()
  }

  async init() {
    this.loadBackground()

    this.boardApi = new BoardApi()

    const info = await this.boardApi.getBoard('1')

    this.connection = new Connection(this.gameId)

    this.loadBoard(info)
  }

  loadBackground() {
    const background = new Background(this.app)

    this.app.stage.addChild(background)
  }

  loadBoard(info: BoardInfo) {
    const board = new Board(this.app, info, this.window)

    this.connection.on('character:new', (info) => board.addPlayer(info))
    this.connection.on('character:leave', (id) => board.removePlayer(id))

    this.app.stage.addChild(board)
  }
}
