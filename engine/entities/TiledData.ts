import { z } from 'zod'

export const zLayerData = z.object({
  data: z.array(z.number()),
  height: z.number(),
  id: z.number(),
  name: z.string(),
  opacity: z.number(),
  type: z.string(),
  visible: z.boolean(),
  width: z.number(),
  x: z.number(),
  y: z.number(),
})

export const zMapData = z.object({
  compressionlevel: z.number(),
  height: z.number(),
  infinite: z.boolean(),
  layers: z.array(zLayerData),
  nextlayerid: z.number(),
  nextobjectid: z.number(),
  orientation: z.string(),
  renderorder: z.string(),
  tiledversion: z.string(),
  tileheight: z.number(),
  tilesets: z.array(
    z.object({
      firstgid: z.number(),
      source: z.string(),
    }),
  ),
  tilewidth: z.number(),
  type: z.string(),
  version: z.string(),
  width: z.number(),
})

export const zDirMeta = z.array(
  z.object({ id: z.string(), filepath: z.string() }),
)

export const zTilesetData = z.object({
  columns: z.number(),
  image: z.string(),
  imageheight: z.number(),
  imagewidth: z.number(),
  margin: z.number(),
  name: z.string(),
  spacing: z.number(),
  tilecount: z.number(),
  tiledversion: z.string(),
  tileheight: z.number(),
  tilewidth: z.number(),
  type: z.string(),
  version: z.string(),
})

export type LayerData = z.infer<typeof zLayerData>
export type MapData = z.infer<typeof zMapData>
export type TilesetData = z.infer<typeof zTilesetData>
