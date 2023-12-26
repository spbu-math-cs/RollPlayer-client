import EventEmitter from 'events'
import Swal from 'sweetalert2'
import { CharacterInfo } from '../entities/CharacterInfo'
import {
  AttackType,
  BASIC_PROPERTIES,
  BASIC_PROPERTY_NAMES,
  BasicProperties,
  ERROR_TEXT,
} from '../GlobalParameters'

export interface ConnectionProperties {
  userInfo: {
    userId: number
    userToken: string
    avatarId: number | undefined
  }
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

    const _userID = this.connectionProperties.userInfo.userId
    const userToken = this.connectionProperties.userInfo.userToken
    const sessionId = this.connectionProperties.sessionId

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/user/sessions/${sessionId}/connect`
    )
    console.log(this.connectionProperties)

    this.ws = ws

    ws.onopen = (event) => {
      console.log('Open', event)
      console.log('Open readyState:', ws.readyState)
      this.ws?.send(userToken)
    }

    ws.onerror = (event) => {
      console.error('Error!', event)
    }

    ws.onclose = (event) => {
      console.log('Close.', event)
    }

    ws.onmessage = (event) => {
      console.log('Message:', event)
      console.log('data:', JSON.parse(event.data))
      this.onMessage(JSON.parse(event.data))
    }

    console.log('readyState:', ws.readyState)
  }

  private onMessage(data: any) {
    switch (data.type) {
      case 'character:new': {
        const basicProperties = Object.entries(BASIC_PROPERTY_NAMES).map(
          ([key, name]) => ({
            name,
            value: data.character.basicProperties[key],
          }),
        )

        const info = new CharacterInfo(
          this,
          data.character.id,
          data.character.name,
          (data.character.avatarId === null) ? undefined : data.character.avatarId,
          data.own,
          false, // canDoAction
          data.character.isDefeated,
          basicProperties,
          data.character.properties,
          data.character.row,
          data.character.col,
        )

        this.characters.set(data.character.id, info)
        this.emit('character:new', info)

        break
      }
      case 'character:leave': {
        const id = data.id

        this.characters.delete(id)
        this.emit('character:leave', { id })

        break
      }
      case 'character:move': {
        const id = data.id
        const newCharacterInfo = data.character
        if (newCharacterInfo === undefined) {
          console.error('Server didn\'t send character info on move')
          break
        }

        const isDefeated = newCharacterInfo.isDefeated

        this.updateCharacterInfo(id, newCharacterInfo, undefined, isDefeated)

        break
      }
      case 'character:attack': {
        const attackType = data.attackType
        const characterId = data.character.id
        const opponentId = data.opponent.id

        this.updateCharacterInfo(characterId, data.character, undefined, data.character.isDefeated)
        this.updateCharacterInfo(opponentId, data.opponent, undefined, data.opponent.isDefeated)

        const character = this.characters.get(characterId)
        const opponent = this.characters.get(opponentId)

        this.emit('character:attack', { type: attackType, character, opponent })

        break
      }
      case 'character:status': {
        const id = data.id
        const newCharacterInfo = data.character
        const canDoAction = data.can_do_action
        const isDefeated = data.is_defeated

        this.updateCharacterInfo(id, newCharacterInfo, canDoAction, isDefeated)

        break
      }
      case 'error': {
        if (data.reason) {
          Swal.fire({
            title: 'Error',
            text: data.reason in ERROR_TEXT ? ERROR_TEXT[data.reason as keyof typeof ERROR_TEXT] : 'Unknown error',
            icon: 'error',
          })
        }

        if (data.on === 'character:move')
          this.emit('character:reset')

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

  private updateCharacterInfo(
    id: number,
    newCharacterInfo: CharacterInfo | undefined,
    canDoAction: boolean | undefined,
    isDefeated: boolean | undefined,
  ) {
    const character = this.characters.get(id)
    if (character === undefined) return

    if (character.isDefeated && !character.canDoAction && canDoAction === true) {
      this.revive(id)
    }

    if (newCharacterInfo === undefined) {
      this.emit('character:status', { id, canDoAction, isDefeated })
      return
    }

    character.properties = newCharacterInfo.properties

    this.emit('character:status', { id, canDoAction, isDefeated })
    this.emit('character:move', { ...newCharacterInfo })
  }

  public createCharacter(
    name: string,
    basicProperties: BasicProperties,
    row: number, col: number
  ) {
    this.send(
      JSON.stringify({
        type: 'character:new',
        name: name,
        row: row,
        col: col,
        basicProperties,
        avatarId: this.connectionProperties.userInfo.avatarId,
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

  public attack(attackType: AttackType, id: number, opponentId: number) {
    this.send(JSON.stringify({
      type: 'character:attack',
      attackType,
      id,
      opponentId,
    }))
  }

  public revive(id: number) {
    this.send(JSON.stringify({
      type: 'character:revive',
      id,
    }))
  }

  public close() {
    this.ws?.close()
  }
}
