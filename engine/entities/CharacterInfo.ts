import { EventEmitter } from 'events'
import { Connection } from '../api/Connection'

export class CharacterInfo extends EventEmitter {
  private _row: number
  private _col: number

  constructor(
    private connection: Connection,
    public readonly id: number,
    public readonly username: string,
    public readonly own: boolean,
    private canDoAction: boolean,
    row: number,
    col: number,
  ) {
    super()

    this._row = row
    this._col = col

    this.connection.on('character:move', this.onMove.bind(this))
    this.connection.on('character:reset', this.onReset.bind(this))
    this.connection.on('character:status', this.onStatusUpdate.bind(this))
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

  private onStatusUpdate({ id, canDoAction }: { id: number; canDoAction: boolean }) {
    if (id !== this.id) return

    this.canDoAction = canDoAction
    this.emit('status', canDoAction)
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
