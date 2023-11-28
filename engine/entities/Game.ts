import { BoardApi } from '../api/BoardApi'
import { Connection } from '../api/Connection'
import { Background } from '../render/Background'
import { Board } from '../render/Board'
import * as PIXI from 'pixi.js'
import { BoardInfo } from './BoardInfo'
import { ConnectionProperties } from '../api/Connection'
import { CharacterContext } from '@/app/play/page'

export class Game {
  connection: Connection
  boardApi: BoardApi
  app: PIXI.Application
  board?: Board
  invalid: boolean = false

  constructor(
    private connectionProperties: ConnectionProperties,
    private canvas: HTMLCanvasElement,
    public readonly window: Window,
  ) {
    this.boardApi = new BoardApi()

    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: canvas.parentElement!,
    })

    this.loadBackground()

    this.connection = new Connection(connectionProperties)
  }

  async startUp() {
    const info = await this.boardApi.getBoard('1')

    this.createBoard(info)

    if (!this.invalid) this.connection.open()
  }

  loadBackground() {
    const background = new Background(this.app)

    this.app.stage.addChild(background)
  }

  createBoard(info: BoardInfo) {
    if (!this.connection)
      throw new Error('Trying to load board without an active connection')

    this.board = new Board(this.app, info, this.window)

    this.board.on('context:character', (context) =>
      this.onCharacterContext(context),
    )

    this.connection.on(
      'character:new',
      (info) => this.board?.addCharacter(info),
    )

    this.connection.on(
      'character:leave',
      (id) => this.board?.removeCharacter(id),
    )

    this.app.stage.addChild(this.board)
  }

  onCharacterContext: (context: CharacterContext) => void = () => {}

  cleanUp() {
    this.invalid = true

    console.log('closeeeeeeeeeeeee')
    this.connection.close()
    if (this.board) this.app.stage.removeChild(this.board)
    this.app.stop()
  }
}
