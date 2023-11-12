import * as PIXI from 'pixi.js'
import { BACKGROUND_SCALE, COMMON_TINT } from '../GlobalParameters'

export class Background extends PIXI.Sprite {
  private texture: PIXI.Texture | null = null

  constructor(
    public readonly app: PIXI.Application
  ) {
    const texture = PIXI.Texture.from('/assets/background.png')

    super(
      texture,
      app.screen.width,
      app.screen.height
    )

    this.texture = texture
    this.anchor.set(0.5)
    this.x = app.screen.width / 2
    this.y = app.screen.height / 2
    this.scale.set(BACKGROUND_SCALE)
    this.tint = COMMON_TINT
    this.zIndex = -1
  }
}
