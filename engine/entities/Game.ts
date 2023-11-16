import { BoardApi } from '../api/BoardApi'
import { Viewport } from 'pixi-viewport'
import { Connection } from '../api/Connection'
import { Background } from '../render/Background'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'
import { BoardInfo } from './BoardInfo'

export class Game {
  connection?: Connection
  boardApi: BoardApi
  app: PIXI.Application
  board?: Board

  constructor(
    private gameId: string,
    private canvas: HTMLCanvasElement,
    public readonly window: Window,
  ) {
    this.boardApi = new BoardApi()

    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.init()
  }

  async init() {
    this.loadBackground()

    const info = await this.boardApi.getBoard('1')

    this.connection = new Connection(this.gameId)

    this.loadBoard(info)
  }

  loadBackground() {
    const background = new Background(this.app)

    this.app.stage.addChild(background)
  }

  loadBoard(info: BoardInfo) {
    if (!this.connection)
      throw new Error('Trying to load board without an active connection')

    this.board = new Board(this.app, info, this.window)

    this.connection.on('character:new', (info) => this.board?.addCharacter(info))
    this.connection.on('character:leave', (id) => this.board?.removeCharacter(id))

    this.app.stage.addChild(this.board)
  }

  cleanUp() {
    if (this.connection) this.connection.close()
    if (this.board) this.app.stage.removeChild(this.board)
    this.app.stop()
  }
}
