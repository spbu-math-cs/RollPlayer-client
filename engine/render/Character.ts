import { CharacterInfo } from '../entities/CharacterInfo'
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

  constructor(
    private board: Board,
    public readonly info: CharacterInfo,
  ) {
    super()

    const outline_color = this.info.own ? 0xff0000 : 0xffffff
    this.lineStyle(1, outline_color, 1)

    this.attack = {
      melee: new MeleeAttack(this.board),
      ranged: new RangedAttack(this.board),
      magic: new MagicAttack(this.board),
    }

    const character_color = getCol(info.id, 0x00, 0xfb)
    this.beginFill(character_color, 1)
    this.drawCircle(0, 0, Math.min(this.board.info.tileWidth, this.board.info.tileHeight) / 3)
    this.endFill()

    this.filters = this.defaultFilters

    this.zIndex = CHARACTER_Z_INDEX

    this.eventMode = 'dynamic'
    this.cursor = 'pointer'

    this.info.on('move', this.onMove.bind(this))
    this.info.on('reset', this.onReset.bind(this))
    this.info.on('status', this.onStatusUpdate.bind(this))
    this.info.on('attack', this.onAttack.bind(this))
    this.info.on('attacked', this.onAttacked.bind(this))

    this.moveAnimated(info.row, info.col, 'elastic.out(0.8, 0.5)')
  }

  private onAttack({ type, opponent }: { type: AttackType, opponent: CharacterInfo }) {
    this.attack[type].animate(this.position, new PIXI.Point(...this.board.calculateTilePosition(opponent.row, opponent.col)))
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
  }

  private onMove({ row, col }: { row: number; col: number }) {
    this.moveAnimated(row, col, 'sine.inOut', 400)
  }

  private onReset() {
    this.moveAnimated(this.info.row, this.info.col)
  }

  private onStatusUpdate({ canDoAction, isDefeated }: { canDoAction: boolean; isDefeated: boolean }) {
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
