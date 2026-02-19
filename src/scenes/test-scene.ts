import { NumTilesHeight, NumTilesWidth, TileHeight, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug, getContext } from '../core/draw'
import { justPressed, keys } from '../core/keys'
import { Debug } from '../util/debug'
import { forEachGI, makeGrid, setGridItem } from '../world/grid'
import { collideWall, updatePhysics } from '../world/physics'
import { Grid } from '../world/grid'
import { FacingDir, vec2, vec3 } from '../types'
import { Actor, bottomY, centerX, newActor, newThing, Thing, ThingType, throwAngle, throwPos } from '../data/actor-data'
import { getAnim } from '../data/anim-data'

const vel = 60
// const diagVel = vel / Math.SQRT2

const dirToAngle = [
  [-135, 180, 135],
  [-90, 0, 90],
  [-45, 0, 45]
]

const getWall = (x:number, y:number):[number, number, number, number] => {
  const xx = x * TileWidth
  const yy = y * TileHeight
  const w = TileWidth
  const h = TileHeight

  return [xx, yy, w, h]
}

export class Scene {
  guy:Actor
  things:Thing[] = []

  walls:Grid<number>

  // TEMP
  // colliding = false

  constructor () {
    this.guy = newActor(vec3(100, 80, 0), vec2(4, 8))

    this.things.push(this.guy)

    this.walls = makeGrid(NumTilesWidth, NumTilesHeight, 1)
    for (let i = 0; i < NumTilesWidth; i++) {
      this.addTile(i, 0)
      this.addTile(i, NumTilesHeight - 1)
    }

    for (let i = 0; i < NumTilesHeight; i++) {
      this.addTile(0, i)
      this.addTile(NumTilesWidth - 1, i)
    }
    console.log(this.walls)
  }

  create () {
    console.log('we here')
  }

  update () {
    let yvel = 0
    let xvel = 0
    let angles = []

    if (keys.get('ArrowUp')) {
      yvel -= 1
      angles.push(270)
      this.guy.facing = FacingDir.Up
    }

    if (keys.get('ArrowDown')) {
      yvel += 1
      angles.push(90)
      this.guy.facing = FacingDir.Down
    }

    if (keys.get('ArrowLeft')) {
      xvel -= 1
      angles.push(180)
      this.guy.facing = FacingDir.Left
    }

    if (keys.get('ArrowRight')) {
      xvel += 1
      angles.push(360)
      this.guy.facing = FacingDir.Right
    }

    if (justPressed.get('x')) {
      this.charThrow()
    }

    if (xvel !== 0 || yvel !== 0) {
      this.guy.vel = 60
      this.guy.angle = dirToAngle[xvel + 1][yvel + 1]
    } else {
      this.guy.vel = 0
    }

    this.things.forEach(thing => {
      thing.stateTime++
      updatePhysics(thing)
    })

    this.checkCollisions()

    this.things = this.things.filter(t => !t.dead)
  }

  draw () {
    forEachGI(this.walls, (x, y, wall) => {
      drawTile(wall, x * TileWidth, y * TileHeight)
    })

    if (Debug.on) {
      forEachGI(this.walls, (x, y, wall) => {
        if (wall !== 0) return
        const [xx, yy, w, h] = getWall(x, y)
        drawDebug(xx, yy, w, h, '#ff0000')
      })
    }

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
        drawDebug(Math.floor(thing.pos.x), Math.floor(thing.pos.y - thing.pos.z), thing.size.x, thing.size.y)
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
        } else {
          // bounce event
          // TODO: zbounce
          thing.pos.z = -thing.pos.z
          thing.zVel = -thing.zVel
        }
      }
    })

    // wall collisions
    this.things.forEach(thing => {
      let collided = false
      forEachGI(this.walls, (x, y, wall) => {
        if (wall !== 0) return
        const [xx, yy, w, h] = getWall(x, y)
        if (collideWall(thing, xx, yy, w, h)) {
          collided = true
        }
      })

      if (collided) {
        this.handleCollision(thing, true)
      }
    })
  }

  // TODO: move out of scene?
  handleCollision (thing:Thing, withWall:boolean) {
    switch (thing.type) {
      case ThingType.Rock:
        thing.health -= 1
        break
      default:
        console.log('other')
        break
    }

    if (thing.health <= 0) {
      thing.dead = true
    }
  }

  addTile (x:number, y:number) {
    setGridItem(this.walls, x, y, 0)
  }

  charThrow () {
    const pos = throwPos(this.guy)
    const angle = throwAngle(this.guy)

    const thing = newThing(pos, 120, angle)
    this.things.push(thing)

    pos.x -= thing.size.x / 2
    pos.y -= thing.size.y / 2
  }
}

