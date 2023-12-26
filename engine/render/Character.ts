import { CharacterInfo, Property } from '../entities/CharacterInfo'
import * as PIXI from 'pixi.js'
import { gsap } from 'gsap/gsap-core'
import { Board } from './Board'
import { Tile } from './Tile'
import { GlowFilter } from '@pixi/filter-glow'
import { DotFilter } from '@pixi/filter-dot'
import { AttackType, CHARACTER_Z_INDEX } from '../GlobalParameters'
import { Attack, MagicAttack, MeleeAttack, RangedAttack } from './Attack'

function getCol(id: number, min: number, max: number) {
  id = ((id + 1) * 1_000_000_000) % 57_885_161

  const r = min + (id * 998_244_353) % (max - min + 1)
  const g = min + (id * 805_306_457) % (max - min + 1)
  const b = min + (id * 1_000_000_007) % (max - min + 1)

  return r * 256 * 256 + g * 256 + b
}

export class Character extends PIXI.Graphics {
  private nearestTile: Tile | null = null

  private readonly defaultFilters = []
  private readonly canDoActionFilters = [new GlowFilter({ distance: 20, outerStrength: 2 })]
  private readonly defeatedFilters = [new DotFilter()]
  private attack: Record<AttackType, Attack>

  private readonly characterSize: number

  private readonly hpIdx: number | undefined
  private readonly maxHpIdx: number | undefined
  private readonly mpIdx: number | undefined
  private readonly maxMpIdx: number | undefined

  constructor(
    private board: Board,
    public readonly info: CharacterInfo,
  ) {
    super()

    for (var i = 0; i < info.properties.length; i++) {
      if (info.properties[i].name == 'Current health') {
        this.hpIdx = i
      }
      if (info.properties[i].name == 'Max health') {
        this.maxHpIdx = i
      }
      if (info.properties[i].name == 'Current mana') {
        this.mpIdx = i
      }
      if (info.properties[i].name == 'Max mana') {
        this.maxMpIdx = i
      }
    }

    this.characterSize = Math.min(this.board.info.tileWidth, this.board.info.tileHeight) / 3
    if (this.info.id == 1) {
      this.characterSize *= 2
    }

    const characterColor = getCol(info.id, 0x00, 0xfb)
    const innerCharacterColor = this.info.own ? 0x8080ff : 0xff8080
    // this.lineStyle(this.characterSize / 5, characterColor, 1)

    this.beginFill(innerCharacterColor, 1)
    this.drawCircle(0, 0, this.characterSize)
    this.endFill()
    this.lineStyle(0, characterColor, 1)

    if (this.info.avatarId !== undefined) {
      const avatar = PIXI.Sprite.from(`${process.env.NEXT_PUBLIC_API_URL}/pictures/${this.info.avatarId}`)
      avatar.anchor.set(0.5)
      avatar.width = this.characterSize * 2
      avatar.height = this.characterSize * 2

      const mask = new PIXI.Graphics()
      mask.beginFill(0xffffff, 1)
      mask.drawCircle(0, 0, this.characterSize * 9 / 10)
      mask.endFill()

      avatar.mask = mask
      this.addChild(mask)
      this.addChild(avatar)
    }

    this.filters = this.defaultFilters

    this.zIndex = CHARACTER_Z_INDEX

    this.eventMode = 'dynamic'
    this.cursor = 'pointer'

    this.info.on('move', this.onMove.bind(this))
    this.info.on('reset', this.onReset.bind(this))
    this.info.on('status', this.onStatusUpdate.bind(this))
    this.info.on('attack', this.onAttack.bind(this))
    this.info.on('attacked', this.onAttacked.bind(this))

    this.attack = {
      melee: new MeleeAttack(this.board),
      ranged: new RangedAttack(this.board),
      magic: new MagicAttack(this.board),
    }

    this.moveAnimated(info.row, info.col, 'elastic.out(0.8, 0.5)')

    this.updateBar()
  }

  private updateBar() {
    this.updateHpBar()
    this.updateManaBar()
  }

  private updateHpBar() {
    if (this.hpIdx === undefined || this.maxHpIdx === undefined) return

    this.drawBar(this.hpIdx, this.maxHpIdx, 1.5, 0xff0000)
  }

  private updateManaBar() {
    if (this.mpIdx === undefined || this.maxMpIdx === undefined) return

    this.drawBar(this.mpIdx, this.maxMpIdx, 2.0, 0x0000ff)
  }

  private drawBar(propIdx: number, maxPropIdx: number, yPos: number, color: number) {
    const prop = this.info.properties[propIdx].value
    const maxProp = this.info.properties[maxPropIdx].value
    const propFrac = prop / maxProp

    const characterSize = this.characterSize
    const BAR_HALF_WIDTH = 1.2
    const BAR_HEIGHT = 0.2
    const BACKGROUND_COLOR = 0x5a2814

    this.beginFill(BACKGROUND_COLOR)
    this.drawRect(
      -characterSize * BAR_HALF_WIDTH,
      -characterSize * yPos,
      characterSize * BAR_HALF_WIDTH * 2,
      characterSize * BAR_HEIGHT
    )
    this.endFill()

    this.beginFill(color)
    this.drawRect(
      -characterSize * BAR_HALF_WIDTH,
      -characterSize * yPos,
      characterSize * BAR_HALF_WIDTH * 2 * propFrac,
      characterSize * BAR_HEIGHT
    )
    this.endFill()
  }

  private onAttack({ type, opponent }: { type: AttackType, opponent: CharacterInfo }) {
    this.attack[type].animate(this.position, new PIXI.Point(...this.board.calculateTilePosition(opponent.row, opponent.col)))
    this.updateBar()
  }

  private onAttacked({ type, character }: { type: AttackType, character: CharacterInfo }) {
    const origX = this.x
    const origY = this.y

    const obj = { range: 0 }
    const self = this
    const delays: Record<AttackType, number> = {
      melee: 0.1,
      ranged: 0.6,
      magic: 0.4
    }
    gsap.to(obj, {
      range: 2,
      yoyo: true,
      repeat: 1,
      duration: 0.2,
      ease: 'expo.out',
      onUpdate(this: gsap.core.Tween) {
        const angle = Math.random() * 2 * Math.PI
        const dist = obj.range
        const dx = Math.cos(angle) * dist
        const dy = Math.sin(angle) * dist
        self.x = origX + dx
        self.y = origY + dy
      }
    }).delay(delays[type])

    this.updateBar()
  }

  private onMove({ row, col }: { row: number; col: number }) {
    this.moveAnimated(row, col, 'sine.inOut', 400)
    this.updateBar()
  }

  private onReset() {
    this.moveAnimated(this.info.row, this.info.col)
    this.updateBar()
  }

  private onStatusUpdate({ canDoAction, isDefeated }: { canDoAction: boolean; isDefeated: boolean }) {
    this.updateBar()

    this.zIndex = CHARACTER_Z_INDEX + 1

    if (canDoAction && isDefeated) {
      this.filters = [...this.canDoActionFilters, ...this.defeatedFilters]
      return
    }

    if (canDoAction) {
      this.filters = this.canDoActionFilters
      return
    }

    this.zIndex = CHARACTER_Z_INDEX

    if (isDefeated) {
      this.filters = this.defeatedFilters
      return
    }

    this.filters = this.defaultFilters
  }

  public activate() {
    this.alpha = 0.75
  }

  public drag(x: number, y: number) {
    this.nearestTile?.deactivateOnCharacterDrag()
    this.x = x
    this.y = y
    this.nearestTile = this.board.getNearestTile(this.x, this.y)
    this.nearestTile.activateOnCharacterDrag()
  }

  public finishMove() {
    const nearestTile = this.nearestTile
    if (!nearestTile) return

    this.info.move(nearestTile.info.row, nearestTile.info.col)
    this.deactivate(false)
  }

  public deactivate(moveBack = true) {
    this.alpha = 1.0
    this.nearestTile?.deactivateOnCharacterDrag()
    this.nearestTile = null

    if (moveBack) this.moveAnimated(this.info.row, this.info.col)
  }

  private moveAnimated(
    row: number,
    col: number,
    easing: gsap.EaseFunction | gsap.EaseString | undefined = undefined,
    timeout = 400,
  ) {
    const target_x = col * this.board.info.tileWidth + this.board.info.tileWidth / 2
    const target_y = row * this.board.info.tileHeight + this.board.info.tileHeight / 2

    gsap.to(this, { pixi: { positionX: target_x, positionY: target_y }, ease: easing, duration: timeout / 1000 })
  }
}
