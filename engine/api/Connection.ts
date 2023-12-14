import EventEmitter from 'events'
import swal from 'sweetalert2'
import { CharacterInfo } from '../entities/CharacterInfo'
import {
  AttackType,
  BASIC_PROPERTIES,
  BASIC_PROPERTY_NAMES,
  BasicProperties,
  ERROR_TEXT,
} from '../GlobalParameters'

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
      case 'character:leave': {
        const id = data.id
        this.characters.delete(id)
        this.emit('character:leave', { id })
        break
      }
      case 'error': {
        if (data.reason) {
          swal.fire({
            title: 'Error',
            text: data.reason in ERROR_TEXT ? ERROR_TEXT[data.reason as keyof typeof ERROR_TEXT] : 'Unknown error',
            icon: 'error',
          })
        }
        if (data.on === 'character:move')
          this.emit('character:reset')

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
      case 'character:attack': {
        const attackType = data.attackType
        const characterId = data.character.id
        const opponentId = data.opponent.id

        // emit attack type

        this.updateCharacterInfo(characterId, data.character, undefined, data.character.isDefeated, data.character)
        this.updateCharacterInfo(opponentId, data.opponent, undefined, data.opponent.isDefeated, data.opponent)

        const character = this.characters.get(characterId)
        const opponent = this.characters.get(opponentId)

        this.emit('character:attack', { character, opponent })

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

  private updateCharacterInfo(
    id: number,
    newCharacterInfo: CharacterInfo | undefined,
    canDoAction: boolean | undefined,
    isDefeated: boolean | undefined,
    characterJson: any | undefined,
  ) {
    this.emit('character:status', { id, canDoAction, isDefeated })

    if (characterJson && this.characters.has(id)) {
      this.characters.get(id).properties = characterJson.properties
    }

    if (newCharacterInfo === undefined) return

    this.emit('character:move', { ...newCharacterInfo })
  }

  public createCharacter(name: string, basicProperties: BasicProperties) {
    this.send(
      JSON.stringify({
        type: 'character:new',
        name: name,
        row: 0,
        col: 0,
        basicProperties,
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

  public close() {
    this.ws?.close()
  }
}
