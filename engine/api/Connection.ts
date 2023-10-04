import EventEmitter from 'events'

export class Connection extends EventEmitter {
  ws: WebSocket

  constructor(public readonly gameId: string) {
    super()
    this.ws = new WebSocket(`wss://${process.env.NEXT_PUBLIC_SOCKET_DOMAIN}/socket`)
    this.ws.onmessage = this.onMessage.bind(this)
  }

  onMessage(e: MessageEvent) {
    // process e.data
  }
}
