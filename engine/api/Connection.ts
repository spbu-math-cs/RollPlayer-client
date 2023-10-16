import EventEmitter from 'events'
import { PlayerInfo } from '../entities/PlayerInfo'

const BOARD_WIDTH = 71
const BOARD_HEIGHT = 47

export class Connection extends EventEmitter {
  ws: WebSocket

  private players: Map<number, PlayerInfo> = new Map()

  constructor(public readonly gameId: string) {
    super()
    if (!process.env.NEXT_PUBLIC_SOCKET_URL)
      throw new Error('Could not find server url in env')

    this.ws = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL)
    // this.ws.addEventListener('message', this.onMessage.bind(this))

    setInterval(this.generateMessage.bind(this), 2000)
  }

  private onMessage(data: any) {
    // if (!e.data) return
    // console.log(e.data)
    // const data = JSON.parse(e.data)
    switch (data.type) {
      case 'player:move':
        this.emit('player:move', { ...data })
        break
      case 'player:new':
        const info = new PlayerInfo(
          this,
          data.id,
          data.username,
          data.own,
          data.row,
          data.col,
        )
        this.emit('player:new', info)
        this.players.set(info.id, info)
        break
      case 'player:reset':
        this.emit('player:reset', { ...data })
        break
      case 'player:leave':
        const id = data.id
        this.players.delete(id)
        this.emit('player:leave', { id })
        break
    }
  }

  public movePlayer(id: number, row: number, col: number) {
    if (Math.random() > 0.5) {
      this.onMessage({ type: 'player:move', id, row, col })
    } else {
      this.onMessage({ type: 'player:reset', id })
    }
  }

  public generateMessage() {
    const rand = (Math.random() * 10) | 0
    const randid = (Math.random() * 100000) | 0
    switch (true) {
      case rand < 3 || this.players.size === 0:
        this.onMessage({
          type: 'player:new',
          id: randid,
          username: 'bob_' + randid,
          own: randid % 2 === 0,
          row: randid % BOARD_HEIGHT,
          col: randid % BOARD_WIDTH,
        })
        break
      case rand < 5:
        this.onMessage({
          type: 'player:leave',
          id: [...this.players.values()][0].id,
        })
        break
      default:
        this.onMessage({
          type: 'player:move',
          id: [...this.players.values()][0].id,
          row: randid % BOARD_HEIGHT,
          col: randid % BOARD_WIDTH,
        })
        break
    }
  }
}
