import { BaseTexture, Point, Rectangle, Sprite, Texture } from "pixi.js";
import { Board } from "./Board";
import { gsap } from "gsap/gsap-core";
import { sound } from '@/engine/pixi-sound-fork/src'

export abstract class Attack {
  abstract animate(from: Point, to: Point): Promise<void>
}

export class MeleeAttack extends Attack {
  private texture: Texture

  constructor(private board: Board) {
    super()
    this.texture = Texture.from('/assets/attacks/stick.png')
  }

  async animate(from: Point, to: Point) {
    if (document.hasFocus())
      sound.play('stick')

    const sprite = new Sprite(this.texture)

    this.board.addChild(sprite)

    sprite.anchor.set(0.5, 0)
    sprite.scale.set(0.1)
    sprite.zIndex = Infinity
    sprite.position = from

    const baseAngle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI - 90
    await gsap.fromTo(sprite, { pixi: { angle: baseAngle - 45, } }, { pixi: { angle: baseAngle + 45 }, ease: 'power2.inOut', duration: 0.3 })

    this.board.removeChild(sprite)
  }
}

export class RangedAttack extends Attack {
  private texture: Texture
  constructor(private board: Board) {
    super()
    this.texture = Texture.from('/assets/attacks/carrot.png')
  }
  async animate(from: Point, to: Point) {
    if (document.hasFocus())
      sound.play('carrot')

    const sprite = new Sprite(this.texture)

    sprite.anchor.set(0.5, 0)
    sprite.scale.set(0.1)
    sprite.zIndex = Infinity
    sprite.position = from

    this.board.addChild(sprite)

    sprite.rotation = Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2

    await gsap.fromTo(sprite,
      { pixi: { positionX: from.x, positionY: from.y, anchorY: 0 } },
      {
        pixi: { positionX: to.x, positionY: to.y, anchorY: 1 },
        ease: 'power2.in', duration: 0.6
      })

    this.board.removeChild(sprite)
  }
}

export class MagicAttack extends Attack {
  private baseTexture: BaseTexture
  private numTiles = 5
  private textureIndex = -1
  private textures: Texture[]
  private WIDTH = 735
  private HEIGHT = 389

  constructor(private board: Board) {
    super()

    this.baseTexture = BaseTexture.from('/assets/attacks/lightning.png')
    this.textures = []

    for (let i = 0; i < this.numTiles; i++)
      this.textures[i] = new Texture(
        this.baseTexture,
        new Rectangle(
          this.WIDTH / this.numTiles * i,
          0,
          this.WIDTH / this.numTiles,
          this.HEIGHT,
        )
      )


  }

  setTextureByIndex(sprite: Sprite, index: number): void {
    if (index === this.textureIndex) return

    this.textureIndex = index

    sprite.texture = this.textures[index]
  }

  async animate(from: Point, to: Point) {
    if (document.hasFocus())
      sound.play('lightning')

    const sprite = new Sprite(this.textures[0])

    sprite.anchor.set(0.5, 0)
    sprite.scale.set(0.1)
    sprite.zIndex = Infinity
    this.board.addChild(sprite)

    sprite.position = from

    sprite.rotation = Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2

    const self = this
    await gsap.fromTo(sprite,
      { pixi: { positionX: from.x, positionY: from.y, anchorY: 0 } },
      {
        pixi: { positionX: to.x, positionY: to.y, anchorY: 1 },
        ease: 'power2.out', duration: 0.8,
        onUpdate(this: gsap.core.Tween) { self.setTextureByIndex(sprite, this.progress() * self.numTiles | 0) }
      })

    this.board.removeChild(sprite)
  }
}
