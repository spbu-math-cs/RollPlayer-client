import axios from 'axios'
import * as PIXI from 'pixi.js'
import {
  MapData,
  TilesetData,
  zDirMeta,
  zMapData,
  zTilesetData,
} from '../entities/TiledData'
import { TileInfo } from '../entities/TileInfo'
import { BoardInfo } from '../entities/BoardInfo'

export class BoardApi {
  private tilesetIds: { [key: string]: string } = {}
  private textureIds: { [key: string]: string } = {}

  private mapCache: { [key: string]: MapData } = {}
  private tilesetCache: { [key: string]: Promise<TilesetData> } = {}
  private baseTextureCache: { [key: string]: PIXI.BaseTexture } = {}

  private axios = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

  constructor() {}

  async getMapId(sessionId: number): Promise<string> {
    const response = await this.axios.get(`/game/${sessionId}/mapId`)
    const mapId = response.data.result
    return mapId
  }

  async getMap(id: string): Promise<MapData> {
    if (this.mapCache[id]) return this.mapCache[id]

    const response = await this.axios.get(`/maps/${id}`)
    return await zMapData.parseAsync(response.data)
  }

  async ensureTilesetIds() {
    if (Object.keys(this.tilesetIds).length > 0) return

    const response = await this.axios.get('/tilesets')
    const dirMeta = await zDirMeta.parseAsync(response.data.result)

    for (const entry of dirMeta) {
      const filename = entry.filepath.split('/').pop()
      if (!filename) continue

      this.tilesetIds[filename] = entry.id
    }
  }

  async getTileset(filename: string): Promise<TilesetData> {
    await this.ensureTilesetIds()

    const id = this.tilesetIds[filename]
    if (id in this.tilesetCache) return await this.tilesetCache[id]

    const promise = (async () => {
      const response = await this.axios.get(`/tilesets/${id}`)
      return await zTilesetData.parseAsync(response.data)
    })()

    return await (this.tilesetCache[id] = promise)
  }

  async ensureTextureIds() {
    if (Object.keys(this.textureIds).length > 0) return
    const response = await this.axios.get('/textures')
    const dirMeta = await zDirMeta.parseAsync(response.data.result)

    for (const entry of dirMeta) {
      const filename = entry.filepath.split('/').pop()
      if (!filename) continue

      this.textureIds[filename] = entry.id
    }
  }

  async getBaseTexture(filepath: string): Promise<PIXI.BaseTexture> {
    await this.ensureTextureIds()

    const id = this.textureIds[filepath]
    if (this.baseTextureCache[id]) return this.baseTextureCache[id]

    return PIXI.BaseTexture.from(
      `${process.env.NEXT_PUBLIC_API_URL}/textures/${id}`,
    )
  }

  async loadLayer(
    mapData: MapData, layerId: number, tiles: TileInfo[][]
  ): Promise<[number | undefined, number | undefined]> {
    const rows = mapData.height
    const cols = mapData.width
    const layer = mapData.layers[layerId]
    let tileWidth: number | undefined
    let tileHeight: number | undefined

    for (let i = 0; i < layer.data.length; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols

      const tileId = layer.data[i]
      if (tiles[row][col] !== undefined || tileId == 0) {
        continue
      }

      const closestTileset = mapData.tilesets
        .filter((tileset) => tileset.firstgid <= tileId)
        .reduce(
          (prev, curr) => (prev.firstgid > curr.firstgid ? prev : curr),
          mapData.tilesets[0],
        )
      const tilesetData = await this.getTileset(closestTileset.source)
      const baseTexture = await this.getBaseTexture(tilesetData.image)

      const tilesetRow = Math.floor(
        (tileId - closestTileset.firstgid) / tilesetData.columns,
      )
      const tilesetCol =
        (tileId - closestTileset.firstgid) % tilesetData.columns
      const curTileWidth = tilesetData.tilewidth
      const curTileHeight = tilesetData.tileheight

      const texture = new PIXI.Texture(
        baseTexture,
        new PIXI.Rectangle(
          tilesetCol * curTileWidth,
          tilesetRow * curTileHeight,
          curTileWidth,
          curTileHeight,
        ),
      )
      tiles[row][col] = new TileInfo(texture, row, col)

      if (tileWidth === undefined) {
        tileWidth = curTileWidth
      } else {
        console.assert(curTileWidth === tileWidth)
      }
      if (tileHeight === undefined) {
        tileHeight = curTileHeight
      } else {
        console.assert(curTileHeight === tileHeight)
      }
    }

    return [tileWidth, tileHeight]
  }

  async getBoard(sessionId: number) {
    const mapId = await this.getMapId(sessionId)
    const mapData = await this.getMap(mapId)
    const rows = mapData.height
    const cols = mapData.width
    const tiles: TileInfo[][] = []
    for (let i = 0; i < rows; i++) tiles.push([])

    let tileWidth: number | undefined
    let tileHeight: number | undefined

    for (let i = mapData.layers.length - 1; i >= 0; i--) {
      const [curTileWidth, curTileHeight] = await this.loadLayer(mapData, i, tiles)

      if (curTileWidth === undefined || curTileHeight === undefined) {
        continue
      }

      if (tileWidth === undefined) {
        tileWidth = curTileWidth
      } else {
        console.assert(curTileWidth === tileWidth)
      }
      if (tileHeight === undefined) {
        tileHeight = curTileHeight
      } else {
        console.assert(curTileHeight === tileHeight)
      }
    }

    return new BoardInfo(rows, cols, tileWidth as number, tileHeight as number, tiles)
  }
}
