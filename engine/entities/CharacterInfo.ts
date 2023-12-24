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
    public readonly name: string,
    public readonly own: boolean,
    private _canDoAction: boolean,
    private _isDefeated: boolean,
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

    if (canDoAction !== undefined) this._canDoAction = canDoAction
    if (isDefeated !== undefined) this._isDefeated = isDefeated

    this.emit('status', { canDoAction: this._canDoAction, isDefeated: this._isDefeated })
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

  public get canDoAction() {
    return this._canDoAction
  }

  public get isDefeated() {
    return this._isDefeated
  }
}
