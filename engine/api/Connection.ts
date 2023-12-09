import EventEmitter from 'events'
import swal from 'sweetalert2'
import { CharacterInfo } from '../entities/CharacterInfo'
import { BASIC_PROPERTIES } from '../GlobalParameters'

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
    const _userToken = this.connectionProperties.userToken
    const sessionId = this.connectionProperties.sessionId

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/${userID}/${sessionId}`,
    )
    console.log(this.connectionProperties)

    this.ws = ws

    ws.onopen = (event) => {
      console.log('Open', event)
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
      case 'character:new': {
        const basicProperties = Object.entries(BASIC_PROPERTIES).map(
          ([key, name]) => ({
            name,
            value: data.character.basicProperties[key],
          }),
        )
        const info = new CharacterInfo(
          this,
          data.character.id,
          data.character.name,
          data.own,
          false,
          basicProperties,
          data.character.properties,
          data.character.row,
          data.character.col,
        )
        this.characters.set(data.character.id, info)
        this.emit('character:new', info)
        break
      }
      case 'character:move': {
        this.emit('character:move', { ...data.character })
        break
      }
      case 'character:leave': {
        const id = data.id
        this.characters.delete(id)
        this.emit('character:leave', { id })
        break
      }
      case 'error': {
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
      }
      case 'character:status': {
        const id = data.id
        const canDoAction = data.can_do_action
        this.emit('character:status', { id, canDoAction })
        break
      }
      case 'character:error': {
        console.info('error:', data)
        break
      }
      case undefined: {
        break
      }
      default: {
        console.error('unknown message type:', data.type)
      }
    }
  }

  private send(message: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.error(
        `Trying to send message "${message}" without opening ws connection`,
      )
      return
    }

    console.log('Sending message: ', JSON.parse(message))

    this.ws.send(message)
  }

  public createCharacter(name: string) {
    this.send(
      JSON.stringify({
        type: 'character:new',
        name: name,
        row: 0,
        col: 0,
      }),
    )
  }

  public removeCharacter(id: number) {
    this.send(
      JSON.stringify({
        type: 'character:remove',
        id: id,
      }),
    )
  }

  public moveCharacter(id: number, row: number, col: number) {
    this.send(
      JSON.stringify({
        type: 'character:move',
        id: id,
        row: row,
        col: col,
      }),
    )
  }

  public close() {
    this.ws?.close()
  }
}
