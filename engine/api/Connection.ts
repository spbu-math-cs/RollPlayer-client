import EventEmitter from 'events'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../GlobalParameters'
import { CharacterInfo } from '../entities/CharacterInfo'

export class Connection extends EventEmitter {
  ws: WebSocket

  private characters: Map<number, CharacterInfo> = new Map()

  constructor(public readonly gameId: string) {
    super()
    if (!process.env.NEXT_PUBLIC_SOCKET_URL)
      throw new Error('Could not find server url in env')

    const userID = 2 // (Math.random() * 10000) | 0
    this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/${userID}/1`)

    this.ws.onopen = (event) => {
      /*
      this.ws.send(JSON.stringify({
        type: 'character:new',
        name: `user_${userID}`,
        row: '0',
        col: '0'
      }))
      */
    }

    this.ws.onerror = (event) => {
      console.log('Error!', event)
    }

    this.ws.onmessage = (event) => {
      console.log('message:', event)

      this.onMessage(JSON.parse(event.data))
    }

    // this.ws.addEventListener('message', this.onMessage.bind(this))

    // setInterval(this.generateMessage.bind(this), 2000)
  }

  private onMessage(data: any) {
    console.log(data)

    switch (data.type) {
      case 'character:move':
        data.id = parseInt(data.id) // ??? fix
        this.emit('character:move', { ...data })
        break
      case 'character:new':
        const info = new CharacterInfo(
          this,
          data.id,
          data.name,
          data.own,
          data.row,
          data.col,
        )
        this.emit('character:new', info)
        this.characters.set(info.id, info)
        break
      /*case 'character:reset':
        this.emit('character:reset', { ...data })
        break*/
      case 'character:leave':
        const id = parseInt(data.id) // ??? fix
        this.characters.delete(id)
        this.emit('character:leave', { id })
        break
      case 'character:status':
        const id_ = parseInt(data.id) // ??? fix
        break
      case 'character:error':
        console.info('error:', data)
        break
      default:
        console.error('unknown message type:', data.type)
    }
  }

  public moveCharacter(id: number, row: number, col: number) {
    if (this.ws.readyState !== WebSocket.OPEN) return

    this.ws.send(JSON.stringify({
      type: 'character:move',
      id: id,
      row: row,
      col: col
    }))

    /*if (Math.random() > 0.5) {
      this.onMessage({ type: 'character:move', id, row, col })
    } else {
      this.onMessage({ type: 'character:reset', id })
    }*/
  }

  // not used anymore
  public generateMessage() {
    const rand = (Math.random() * 10) | 0
    const randid = (Math.random() * 100000) | 0
    switch (true) {
      case rand < 3 || this.characters.size === 0:
        this.onMessage({
          type: 'character:new',
          id: randid,
          username: 'bob_' + randid,
          own: randid % 2 === 0,
          row: randid % BOARD_HEIGHT,
          col: randid % BOARD_WIDTH,
        })
        break
      case rand < 5:
        this.onMessage({
          type: 'character:leave',
          id: [...this.characters.values()][0].id,
        })
        break
      default:
        this.onMessage({
          type: 'character:move',
          id: [...this.characters.values()][0].id,
          row: randid % BOARD_HEIGHT,
          col: randid % BOARD_WIDTH,
        })
        break
    }
  }

  public close() {
    this.ws.close()
  }
}
