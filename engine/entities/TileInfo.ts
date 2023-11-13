export class TileInfo {
  constructor(
    public readonly texture: PIXI.Texture,
    public readonly row: number,
    public readonly col: number,
  ) {}
}
