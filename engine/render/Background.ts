import * as PIXI from 'pixi.js'

const COMMON_TINT = 0xb0b0b0
const HIGHLIGHT_TINT = 0xffffff

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
    this.scale.set(1.35)
    this.tint = COMMON_TINT
    this.zIndex = -1
  }
}
