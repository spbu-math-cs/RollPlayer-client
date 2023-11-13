import { TileInfo } from './TileInfo'

export class BoardInfo {
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly tiles: TileInfo[][],
  ) {}
}
