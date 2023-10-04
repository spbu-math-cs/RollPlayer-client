import { Application, Color, Graphics, Text, TextStyle } from 'pixi.js'
import { FieldApi, IFieldInfo } from '../api/FieldApi'
import { Connection } from '../api/Connection'
import EventEmitter from 'events'

export type Player = object

export class Field extends EventEmitter {
  private readonly gameId: string
  private readonly app: Application
  private readonly connection: Connection
  private readonly fieldApi: FieldApi
  private readonly players: Player[] = []

  constructor(gameId: string, canvas: HTMLCanvasElement) {
    super()

    this.gameId = gameId
    this.app = new Application({ view: canvas, resizeTo: canvas.parentElement! })

    this.connection = new Connection(gameId)
    this.fieldApi = new FieldApi()

    this.connection.on('player_new', (player: Player) => this.addPlayer(player))

    this.fieldApi.getField().then(this.loadField.bind(this))

    this.loading()
  }

  loading() {
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: ['#ffffff'], // gradient
      strokeThickness: 5,
      lineJoin: 'round',
    })

    const text = new Text('Loading...', style)

    this.app.ticker.add(() => {
      text.position.x = this.app.screen.width / 2
      text.position.y = this.app.screen.height / 2
      text.anchor.set(0.5)
    })

    this.app.stage.addChild(text)
  }

  addPlayer(player: Player) {
    // this is an example
  }

  loadField(info: IFieldInfo) {}
}
