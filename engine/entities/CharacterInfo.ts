import { EventEmitter } from 'events'
import { Connection } from '../api/Connection'
import { AttackType, BASIC_PROPERTIES } from '../GlobalParameters'

export type Property = { name: string; value: number }

export class CharacterInfo extends EventEmitter {
  private _row: number
  private _col: number

  constructor(
    private connection: Connection,
    public readonly id: number,
    public readonly username: string,
    public readonly own: boolean,
    private canDoAction: boolean,
    private isDefeated: boolean,
    public basicProperties: Property[],
    public properties: Property[],
    row: number,
    col: number,
  ) {
    super()

    this._row = row
    this._col = col

    this.connection.on('character:move', this.onMove.bind(this))
    this.connection.on('character:reset', this.onReset.bind(this))
    this.connection.on('character:status', this.onStatusUpdate.bind(this))
    this.connection.on('character:attack', this.onAttack.bind(this))
  }

  private onMove({ id, row, col }: { id: number; row: number; col: number }) {
    if (id !== this.id) return

    this._row = row
    this._col = col

    this.emit('move', { row, col })
  }

  private onReset() {
    // private onReset({ id }: { id: number }) {
    // if (id !== this.id) return

    this.emit('reset')
  }

  private onAttack({ type, character, opponent }: { type: AttackType, character: CharacterInfo, opponent: CharacterInfo }) {
    if (character.id === this.id) {
      this.emit('attack', { type, opponent })
      return
    }
    if (opponent.id === this.id) {
      this.emit('attacked', { type, character })
      return
    }
  }

  private onStatusUpdate({
    id,
    canDoAction,
    isDefeated,
  }: {
    id: number
    canDoAction: boolean | undefined
    isDefeated: boolean | undefined
  }) {
    if (id !== this.id) return

    if (canDoAction !== undefined) this.canDoAction = canDoAction
    if (isDefeated !== undefined) this.isDefeated = isDefeated

    this.emit('status', { canDoAction: this.canDoAction, isDefeated: this.isDefeated })
  }

  public attack(attackType: AttackType, opponentId: number) {
    this.connection.attack(attackType, this.id, opponentId)
  }

  public move(row: number, col: number) {
    this.connection.moveCharacter(this.id, row, col)
  }

  public remove() {
    this.connection.removeCharacter(this.id)
  }

  public get row() {
    return this._row
  }

  public get col() {
    return this._col
  }
}
