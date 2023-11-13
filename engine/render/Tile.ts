import * as PIXI from 'pixi.js'
import { Board } from './Board'
import { TileInfo } from '../entities/TileInfo'
import { CELL_WIDTH, CELL_HEIGHT, CELL_SCALE, ACTIVATED_CELL_SCALE } from '../GlobalParameters'
import { COMMON_TINT, HIGHLIGHT_TINT } from '../GlobalParameters'

const ACTUAL_CELL_WIDTH = CELL_WIDTH * CELL_SCALE
const ACTUAL_CELL_HEIGHT = CELL_HEIGHT * CELL_SCALE

export class Tile extends PIXI.Sprite {
  private originalScale: number

  constructor(
    private readonly board: Board,
    public readonly info: TileInfo,
  ) {
    super()

    this.texture = PIXI.Texture.from(info.texture)
    this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

    /*
    PIXI.Assets.load(info.texture).then((texture) => {
      //this.texture = PIXI.Texture.from(info.texture)
      this.texture = texture
      this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

      // console.log("kek")

      //this.texture.frame = new PIXI.Rectangle(4, 4, 8, 8)
    });
    */


    this.anchor.set(0.5)
    this.width = ACTUAL_CELL_WIDTH
    this.height = ACTUAL_CELL_HEIGHT
    this.scale.set(CELL_SCALE)
    // console.log(this)
    // console.log(this.scale)
    //this.originalScale = this.scale.x
    this.tint = COMMON_TINT

    this.position.set(...this.board.calculateTilePosition(info.row, info.col))
  }

  activate() {
    // console.log("frame", this.texture.frame)
    // console.log("_frame", this.texture._frame)
    // const frame = this.texture._frame
    // this.texture._frame = new PIXI.Rectangle(0, 0, 16, 16)
    // this.texture.updateUvs()
    this.scale.set(ACTIVATED_CELL_SCALE)
    // this.texture._frame = frame
    // this.texture.updateUvs()
    this.tint = HIGHLIGHT_TINT
    this.zIndex = this.board.info.rows * this.board.info.cols
  }

  deactivate() {
    // const frame = this.texture._frame
    // this.texture._frame = new PIXI.Rectangle(0, 0, 16, 16)
    // this.texture.updateUvs()
    this.scale.set(CELL_SCALE)
    // this.texture._frame = frame
    // this.texture.updateUvs()
    this.tint = COMMON_TINT
    this.zIndex = 0
  }
}
