import { Height, NumTilesHeight, NumTilesWidth, TileHeight, TileWidth, Width } from '../core/const'
import { drawSprite, drawTile, drawDebug, getContext } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { Debug } from '../util/debug'
import { forEachGI, getGridItem, makeGrid, setGridItem } from '../world/grid'
import { collideWallProj, collideWallXY, thingsOverlap, updatePhysics } from '../world/physics'
import { Grid } from '../world/grid'
import { clone3, Collides, collides, FacingDir, vec2, vec3 } from '../types'
import { Actor, bottomY, centerX, newActor, newThing, Thing, ThingType, facingAngle, throwPos, ThingState as T$, setState, holdPos } from '../data/actor-data'
import { getAnim } from '../data/anim-data'
import { randomInt } from '../util/random'

const guyRunVel = 60
// const diagVel = vel / Math.SQRT2

const dirToAngle = [
  [225, 180, 135],
  [270, 0, 90],
  [315, 0, 45]
]

const getWall = (grid:Grid<number>, x:number, y:number):[number, number, number, number, Collides] => {
  const xx = x * TileWidth
  const yy = y * TileHeight
  const w = TileWidth
  const h = TileHeight

  const c = collides(
    x !== 0 && getGridItem(grid, x - 1, y) !== 0,
    x !== grid.width - 1 && getGridItem(grid, x + 1, y) !== 0,
    y !== 0 && getGridItem(grid, x, y - 1) !== 0,
    y !== grid.height - 1 && getGridItem(grid, x, y + 1) !== 0
  )

  return [xx, yy, w, h, c]
}

const JumpFrames = 5

type FloorParticle = {
  x:number
  y:number
  index:number
  frames:number
}

export class Scene {
  worldx:number = 0
  worldy:number = 0

  walls!:Grid<number>
  floorParticles:FloorParticle[] = []
  things:Thing[] = []

  // player state
  guy:Actor
  jumpBuffer:number = JumpFrames + 1
  throwTime:number = 0
  facingDirs:FacingDir[] = []

  // TEMP:
  pCollided:boolean = false
  checks:number = 0

  constructor () {
    this.guy = newActor(vec3(100, 80, 0), vec2(4, 8))

    this.things.push(this.guy)

    this.makeWalls(true)
  }

  create () {
    console.log('we here')
  }

  update () {
    /////////// START PLAYER STUFF ///////////
    let yvel = 0
    let xvel = 0
    this.jumpBuffer++

    if (justPressed.get('ArrowUp')) this.addFacingDir(FacingDir.Up)
    if (keys.get('ArrowUp')) {
      yvel -= 1
    } else {
      this.removeFacingDir(FacingDir.Up)
    }

    if (justPressed.get('ArrowDown')) this.addFacingDir(FacingDir.Down)
    if (keys.get('ArrowDown')) {
      yvel += 1
    } else {
      this.removeFacingDir(FacingDir.Down)
    }

    if (justPressed.get('ArrowLeft')) this.addFacingDir(FacingDir.Left)
    if (keys.get('ArrowLeft')) {
      xvel -= 1
    } else {
      this.removeFacingDir(FacingDir.Left)
    }

    if (justPressed.get('ArrowRight')) this.addFacingDir(FacingDir.Right)
    if (keys.get('ArrowRight')) {
      xvel += 1
    } else {
      this.removeFacingDir(FacingDir.Right)
    }

    if (this.facingDirs.length > 0 && this.guy.state === T$.None) {
      this.guy.facing = this.facingDirs[this.facingDirs.length - 1]
    }

    if (justPressed.get('x')) {
      this.jumpBuffer = 0
    }

    // TEMP:
    if (justPressed.get('z')) {
      this.things = this.things.filter(t => t === this.guy)
    }

    const touchingGround = this.guy.pos.z === 0

    if (this.guy.state === T$.None && this.jumpBuffer <= JumpFrames && touchingGround) {
      this.guyJump()
    }

    if (this.guy.state === T$.None && justPressed.get('c')) {
      this.guyStartThrow()
    }

    if (this.guy.state === T$.PreThrow && !keys.get('c')) {
      this.guyThrow()
    }

    if (this.guy.state === T$.Throw && this.guy.stateTime > 60) {
      setState(this.guy, T$.None)
    }

    if (!touchingGround) {
      let targetAngle = dirToAngle[xvel + 1][yvel + 1]
      if (Math.abs(this.guy.angle - targetAngle) > 180) {
        targetAngle -= 360
      }
      const angleDiff = Math.abs(this.guy.angle - targetAngle)
      // confusing way to say we lessen velocity and change target angle if
      // the player is trying to readjust in mid-air
      if (xvel !== 0 || yvel !== 0) {
        if (this.guy.vel === 0) {
          this.guy.angle = targetAngle
          this.guy.vel = 2
        } else if (angleDiff > 160 && angleDiff < 200) {
          this.guy.vel = Math.max(this.guy.vel - 2, 0)
        } else if (angleDiff === 0) {
          this.guy.vel = Math.min(this.guy.vel + 2, guyRunVel)
        } else if (angleDiff < 20) {
          this.guy.angle += (targetAngle > this.guy.angle ? 1 : -1)
          this.guy.vel = Math.min(this.guy.vel + 1, guyRunVel)
        } else {
          this.guy.angle += (targetAngle > this.guy.angle ? 3 : -3)
          this.guy.vel = Math.max(this.guy.vel - 1, 0)
        }
      } else {
        this.guy.vel = Math.max(this.guy.vel - 5, 0)
      }
    } else if ((xvel !== 0 || yvel !== 0) && this.guy.state !== T$.Throw) {
      const vel = this.guy.state === T$.PreThrow ? guyRunVel / 2 : guyRunVel
      this.guy.vel = vel
      this.guy.angle = dirToAngle[xvel + 1][yvel + 1]
    } else {
      this.guy.vel = 0
    }
    /////////// END PLAYER STUFF ///////////

    this.things.forEach(thing => {
      thing.stateTime++
      if (!thing.held) updatePhysics(thing)
    })

    this.things.forEach(thing => {
      const t = thing as Actor
      if (t.isActor && t.holding) {
        t.holding.pos = holdPos(t)
      }
    })

    this.checkCollisions()

    this.things = this.things.filter(t => !t.dead)

    this.floorParticles = this.floorParticles.filter(fp => {
      fp.frames--
      return fp.frames > 0
    })

    this.checkExits()
  }

  draw () {
    forEachGI(this.walls, (x, y, wall) => {
      drawTile(wall, x * TileWidth, y * TileHeight)
    })

    if (Debug.on) {
      forEachGI(this.walls, (x, y, wall) => {
        if (wall !== 0) return
        const [xx, yy, w, h] = getWall(this.walls, x, y)
        drawDebug(xx, yy, w, h, '#ff0000')
      })
    }

    getContext().globalAlpha = 0.3
    this.floorParticles.forEach(fp => {
      // has a interesting effect when not rounded
      // drawSprite(fp.x, fp.y, fp.index)
      drawSprite(Math.round(fp.x), Math.round(fp.y), fp.index)
    })

    const things = this.things.filter(t => true)
      .sort((a, b) => (a.pos.y + a.size.y/* - a.pos.z*/) - (b.pos.y + b.size.y/* - b.pos.z*/))

    // draw shadows
    getContext().globalAlpha = 0.7
    things.forEach(thing => {
      if (thing.type === ThingType.Rock) {
        const shadowSize = 3
        drawSprite(Math.floor(thing.pos.x) - thing.offset.x, Math.floor(thing.pos.y) - thing.offset.y, 239 + shadowSize)
      } else {
        const shadowSize = 10
        drawSprite(Math.floor(centerX(thing) - 8), Math.floor(bottomY(thing) - 8), 239 + shadowSize)
      }
    })
    getContext().globalAlpha = 1.0

    things.forEach(thing => {
      if (thing.type === ThingType.Rock) {
        drawSprite(Math.floor(thing.pos.x) - thing.offset.x, Math.floor(thing.pos.y - thing.pos.z) - thing.offset.y, getAnim(thing))
      } else {
        // PERF:
        const actor = thing as Actor
        drawSprite(Math.floor(actor.pos.x) - actor.offset.x, Math.floor(actor.pos.y - actor.pos.z) - actor.offset.y, 64 + actor.facing)
      }
    })

    if (Debug.on) {
      this.things.forEach(thing => {
        // front
        const color = thing === this.guy && this.pCollided ? '#00ffff' : '#0000ff'
        drawDebug(Math.floor(thing.pos.x), Math.floor(thing.pos.y + thing.size.y - thing.size.z - thing.pos.z), thing.size.x, thing.size.z, color)
        // top
        drawDebug(Math.floor(thing.pos.x), Math.floor(thing.pos.y - thing.pos.z - thing.size.y), thing.size.x, thing.size.y)
      })
    }
  }

  checkCollisions () {
    // ground collisions
    this.things.forEach(thing => {
      if (thing.pos.z < 0) {
        // if the thing was on the ground, stay on the ground
        if (thing.last.z === 0) {
          thing.pos.z = 0
          thing.zVel = 0
        } else {
          thing.pos.z = -thing.pos.z
          thing.zVel = -thing.zVel * thing.bounce
          thing.vel = thing.vel * thing.bounce

          if (thing.vel > 60 || thing.zVel > 60) {
            this.floorParticles.push({
              x: thing.pos.x - thing.offset.x, y: thing.pos.y - thing.offset.y,
              index: 224 + randomInt(3), frames: 5
            })
          }

          if (Math.abs(thing.zVel) < 15) thing.zVel = 0
          if (Math.abs(thing.vel) < 15) thing.vel = 0
        }
      }
    })

    // wall collisions
    this.things.forEach(thing => {
      let collided = false
      forEachGI(this.walls, (x, y, wall) => {
        if (wall !== 0) return
        const [xx, yy, w, h, collides] = getWall(this.walls, x, y)
        if (thing === this.guy) {
          if (collideWallXY(thing, xx, yy, w, h, collides)) {
            collided = true
          }
        } else {
          // TODO: merge and do the `collides.up` if in `collideWallProj`
          if (collideWallProj(thing, xx, yy, w, h, collides)) {
            collided = true
            this.floorParticles.push({
              x: thing.pos.x - thing.offset.x, y: thing.pos.y - thing.offset.y - thing.pos.z,
              index: 224 + randomInt(3), frames: 5
            })
          }
        }
      })

      if (collided) {
        this.handleCollision(thing, true)
      }
    })

    this.checks = 0
    this.pCollided = false
    const checked = new Map<Thing, Thing[]>()
    // thing collisions
    this.things.forEach(thing1 => {
      this.things.forEach(thing2 => {
        if (thing1 === thing2) return
        if (checked.get(thing2)?.includes(thing1)) return

        this.checks++

        this.checkThingCollision(thing1, thing2)

        if (checked.get(thing1)) {
          checked.get(thing1)!.push(thing2)
        } else {
          checked.set(thing1, [thing2])
        }
      })
    })
  }

  checkThingCollision (t1:Thing, t2:Thing) {
    if (thingsOverlap(t1, t2)) {
      this.pCollided = true
    }
  }

  // TODO: move out of scene?
  // results of the collision that isn't physics-related
  handleCollision (thing:Thing, withWall:boolean) {
    switch (thing.type) {
      case ThingType.Rock:
        thing.health -= 1
        break
      default:
        console.log('other')
        break
    }

    if (thing.health === 0) {
      thing.dead = true
    }
  }

  addTile (x:number, y:number) {
    setGridItem(this.walls, x, y, 0)
  }

  guyStartThrow () {
    setState(this.guy, T$.PreThrow)
    const pos = holdPos(this.guy)
    const angle = facingAngle(this.guy.facing)

    const thing = newThing(pos, angle, true)
    this.guy.holding = thing
    this.things.push(thing)
  }

  guyThrow () {
    const pos = throwPos(this.guy)
    const angle = facingAngle(this.guy.facing)
    const thing = this.guy.holding

    if (!thing) {
      throw new Error('No thing to throw')
    }

    thing.held = false
    thing.zVel = 30
    thing.vel = 120
    thing.pos = clone3(pos)
    // center thing util?
    pos.x -= thing.size.x / 2
    pos.y -= thing.size.y / 2
    thing.angle = angle

    setState(this.guy, T$.Throw)
    this.guy.holding = undefined
  }

  guyJump () {
    this.guy.zVel = 60
  }

  makeWalls (doorsOpen:boolean) {
    this.walls = makeGrid(NumTilesWidth, NumTilesHeight, 1)
    for (let i = 0; i < NumTilesWidth; i++) {
      if (doorsOpen && (i === 4 || i === 5)) continue
      this.addTile(i, 0)
      this.addTile(i, NumTilesHeight - 1)
    }

    for (let i = 0; i < NumTilesHeight; i++) {
      if (doorsOpen && (i === 4 || i === 5)) continue
      this.addTile(0, i)
      this.addTile(NumTilesWidth - 1, i)
    }
  }

  checkExits () {
    if (this.guy.pos.x + this.guy.size.x < 0) {
      this.goNewRoom(FacingDir.Left)
    } else if (this.guy.pos.x > Width) {
      this.goNewRoom(FacingDir.Right)
    } else if (this.guy.pos.y + this.guy.size.y < 0) {
      this.goNewRoom(FacingDir.Up)
    } else if (this.guy.pos.y > Height) {
      this.goNewRoom(FacingDir.Down)
    }
  }

  goNewRoom (dir:FacingDir) {
    switch (dir) {
      case FacingDir.Left:
        this.worldx--
        this.guy.pos.x += (Width + 8)
        break
      case FacingDir.Right:
        this.worldx++
        this.guy.pos.x -= (Width + 8)
        break
      case FacingDir.Up:
        this.worldy--
        this.guy.pos.y += (Height + 8)
        break
      case FacingDir.Down:
        this.worldy++
        this.guy.pos.y -= (Height + 8)
        break
    }

    this.floorParticles = []
    this.things = [this.guy]

    this.makeWalls(true)
  }

  addFacingDir (dir:FacingDir) {
    this.removeFacingDir(dir)
    this.facingDirs.push(dir)
  }

  removeFacingDir (dir:FacingDir) {
    this.facingDirs = this.facingDirs.filter(d => d !== dir)
  }
}
