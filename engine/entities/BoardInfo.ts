import { TileInfo } from './TileInfo'

export class BoardInfo {
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly tileWidth: number, // in pixels
    public readonly tileHeight: number, // in pixels
    public readonly tiles: TileInfo[][],
  ) {}
}
