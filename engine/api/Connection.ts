import EventEmitter from 'events'
import swal from 'sweetalert2'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../GlobalParameters'
import { CharacterInfo } from '../entities/CharacterInfo'

export interface ConnectionProperties {
  userId: number
  userToken: string
  sessionId: number
}

export class Connection extends EventEmitter {
  ws?: WebSocket

  characters: Map<number, CharacterInfo> = new Map()

  constructor(public readonly connectionProperties: ConnectionProperties) {
    super()
  }

  public open() {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL)
      throw new Error('Could not find server url in env')

    const userID = this.connectionProperties.userId
    const userToken = this.connectionProperties.userToken
    const sessionId = this.connectionProperties.sessionId

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/${userID}/${sessionId}`,
    )
    console.log(this.connectionProperties)

    this.ws = ws

    ws.onopen = (event) => {
      console.log('Open', event)
      // this.ws.send('kek')
      console.log('Open readyState:', ws.readyState)
    }

    ws.onerror = (event) => {
      console.log('Error!', event)
    }

    ws.onclose = (event) => {
      console.log('Close.', event)
    }

    ws.onmessage = (event) => {
      console.log('Message:', event)
      this.onMessage(JSON.parse(event.data))
    }

    console.log('readyState:', ws.readyState)
  }

  private onMessage(data: any) {
    switch (data.type) {
      case 'character:new':
        const info = new CharacterInfo(
          this,
          data.id,
          data.name,
          data.own,
          data.row,
          data.col,
        )
        this.characters.set(data.id, info)
        this.emit('character:new', info)
        break
      case 'character:move':
        data.id = parseInt(data.id) // ??? fix
        this.emit('character:move', { ...data })
        break
      case 'character:leave':
        const id = parseInt(data.id)
        this.characters.delete(id)
        this.emit('character:leave', { id })
        break
      case 'error':
        switch (data.on) {
          case 'character:move':
            this.emit('character:reset')
            swal.fire({
              title: 'Error',
              text: data.message,
              icon: 'error',
            })

            break
        }
        break
      case 'character:status':
        const id_ = parseInt(data.id) // ??? fix
        break
      case 'character:error':
        console.info('error:', data)
        break
      // default:
      //   console.error('unknown message type:', data.type)
    }
  }

  public createCharacter(name: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return

    this.ws.send(
      JSON.stringify({
        type: 'character:new',
        name: name,
        row: 0,
        col: 0,
      }),
    )
  }

  public removeCharacter(id: number) {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(
      JSON.stringify({
        type: 'character:remove',
        id: id,
      }),
    )
  }

  public moveCharacter(id: number, row: number, col: number) {
    if (this.ws?.readyState !== WebSocket.OPEN) return

    this.ws.send(
      JSON.stringify({
        type: 'character:move',
        id: id,
        row: row,
        col: col,
      }),
    )

    /*if (Math.random() > 0.5) {
      this.onMessage({ type: 'character:move', id, row, col })
    } else {
      this.onMessage({ type: 'character:reset', id })
    }*/
  }

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
    this.ws?.close()
  }
}
