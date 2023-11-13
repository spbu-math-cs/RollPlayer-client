import EventEmitter from 'events'
import { PlayerInfo } from '../entities/PlayerInfo'

const BOARD_WIDTH = 17
// const BOARD_WIDTH = 11
const BOARD_HEIGHT = 11
// const BOARD_HEIGHT = 7

function sleepFor(sleepDuration: number) {
  var now = new Date().getTime()
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}

export class Connection extends EventEmitter {
  ws: WebSocket

  private players: Map<number, PlayerInfo> = new Map()

  constructor(public readonly gameId: string) {
    super()
    if (!process.env.NEXT_PUBLIC_SOCKET_URL)
      throw new Error('Could not find server url in env')

    // this.ws = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL)
    const userID = (Math.random() * 10000) | 0
    this.ws = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/${userID}/0`)

    this.ws.onopen = (event) => {
      console.log('Open', event)
      // this.ws.send('kek')
      console.log('Open readyState:', this.ws.readyState)

      this.ws.send(
        JSON.stringify({
          type: 'character:new',
          name: `user_${userID}`,
          row: 0,
          col: 0,
        }),
      )
    }

    this.ws.onerror = (event) => {
      console.log('Error!', event)
    }

    this.ws.onclose = (event) => {
      console.log('Close.', event)
    }

    this.ws.onmessage = (event) => {
      console.log('Message:', event)
      this.onMessage(JSON.parse(event.data))
    }

    console.log('readyState:', this.ws.readyState)

    /*
    this.ws.send(JSON.stringify({
        'type': 'character:new',
        'name': `user_${userID}`,
        'row': '0',
        'col': '0'
      }))
    */

    /*
  this.ws.onopen = () => {
    this.ws.send(JSON.stringify({
      'type': 'character:new',
      'name': `user_${userID}`,
      'row': '0',
      'col': '0'
    }))
    
    console.log('Connection open!')
  }
    */
    /*const ws = this.ws
    
    ws.onopen = function () {
      ws.send(JSON.stringify({
        "type": "character:new",
        "name": `user_${userID}`,
        "row": "0",
        "col": "0"
      }))
      
      console.log('Connection open!')
    }*/

    // this.ws.addEventListener('message', this.onMessage.bind(this))

    // setInterval(this.generateMessage.bind(this), 2000)
  }

  private onMessage(data: any) {
    // if (!e.data) return
    console.log('message:', data)
    // const data = JSON.parse(e.data)

    switch (data.type) {
      case 'character:move':
        console.log('move', data)
        console.log({ ...data })
        data.type = 'character:move'
        data.id = parseInt(data.id)
        this.emit('character:move', { ...data })
        // this.onMessage({ type: 'character:move', id: parseInt(data.id), row: data.row, col: data.col })
        break
      case 'character:new':
        const info = new PlayerInfo(
          this,
          data.id,
          data.name,
          data.own,
          data.row,
          data.col,
        )
        this.emit('character:new', info)
        this.players.set(info.id, info)
        break
      /*case 'character:reset':
        this.emit('character:reset', { ...data })
        break*/
      case 'character:leave':
        const id = parseInt(data.id)
        this.players.delete(id)
        this.emit('character:leave', { id })
        break
    }
  }

  public movePlayer(id: number, row: number, col: number) {
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
      case rand < 3 || this.players.size === 0:
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
          id: [...this.players.values()][0].id,
        })
        break
      default:
        this.onMessage({
          type: 'character:move',
          id: [...this.players.values()][0].id,
          row: randid % BOARD_HEIGHT,
          col: randid % BOARD_WIDTH,
        })
        break
    }
  }
}
