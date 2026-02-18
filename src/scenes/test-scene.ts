import { TileHeight, TileSize, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug, getContext } from '../core/draw'
import { keys } from '../core/keys'
import { Debug } from '../util/debug'
import { forEachGI, makeGrid, setGridItem } from '../world/grid'
import { collideWall, updatePhysics } from '../world/physics'
import { Grid } from '../world/grid'
import { FacingDir, vec2, vec3 } from '../types'
import { Actor, bottomY, centerX, newActor, newThing, Thing, ThingType } from '../data/actor-data'
import { getAnim } from '../data/anim-data'

const vel = 60
const diagVel = vel / Math.SQRT2

const getWall = (x:number, y:number):[number, number, number, number] => {
  const xx = x * TileSize
  const yy = y * TileSize
  const w = TileSize
  const h = TileSize

  return [xx, yy, w, h]
}

export class Scene {
  guy:Actor
  things:Thing[] = []
  // walls:number[] = []

  walls:Grid<number>

  // TEMP
  // colliding = false

  constructor () {
    this.guy = newActor(vec3(100, 80, 0), vec2(4, 8))

    this.things.push(this.guy)
    this.things.push(newThing(vec3(100, 80, 8), vec2(6, 6)))
    this.things.push(newThing(vec3(100, 80, 8), vec2(6, 6)))
    this.things.push(newThing(vec3(100, 80, 8), vec2(6, 6)))
    this.things.push(newThing(vec3(100, 80, 8), vec2(6, 6)))
    this.things.push(newThing(vec3(100, 80, 8), vec2(6, 6)))

    this.walls = makeGrid(TileWidth, TileHeight, 1)
    for (let i = 0; i < TileWidth; i++) {
      this.addTile(i, 0)
      this.addTile(i, TileHeight - 1)
    }

    for (let i = 0; i < TileHeight; i++) {
      this.addTile(0, i)
      this.addTile(TileWidth - 1, i)
    }
    console.log(this.walls)
  }

  create () {
    console.log('we here')
  }

  update () {
    let yvel = 0
    let xvel = 0

    if (keys.get('ArrowUp')) {
      yvel -= 1
      this.guy.facing = FacingDir.Up
    }

    if (keys.get('ArrowDown')) {
      yvel += 1
      this.guy.facing = FacingDir.Down
    }

    if (keys.get('ArrowLeft')) {
      xvel -= 1
      this.guy.facing = FacingDir.Left
    }

    if (keys.get('ArrowRight')) {
      xvel += 1
      this.guy.facing = FacingDir.Right
    }

    if (keys.get('x')) {
      this.charThrow()
    }

    const speed = xvel !== 0 && yvel !== 0 ? diagVel : vel
    this.guy.vel.x = xvel * speed
    this.guy.vel.y = yvel * speed

    this.things.forEach(thing => {
      thing.stateTime++
      updatePhysics(thing)
    })

    this.checkCollisions()
  }

  draw () {
    forEachGI(this.walls, (x, y, wall) => {
      drawTile(wall, x * TileSize, y * TileSize)
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
      if (thing.type === ThingType.Ball) {
        const shadowSize = 3
        drawSprite(Math.floor(thing.pos.x) - thing.offset.x, Math.floor(thing.pos.y) - thing.offset.y, 239 + shadowSize)
      } else {
        const shadowSize = 10
        drawSprite(Math.floor(centerX(thing) - 8), Math.floor(bottomY(thing) - 8), 239 + shadowSize)
      }
    })
    getContext().globalAlpha = 1.0

    things.forEach(thing => {
      if (thing.type === ThingType.Ball) {
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
        if (thing.last.z === 0) {
          thing.pos.z = 0
        } else {
          thing.pos.z = -thing.pos.z
          thing.vel.z = -thing.vel.z
        }
      }
    })

    // wall collisions
    this.things.forEach(thing => {
      forEachGI(this.walls, (x, y, wall) => {
        if (wall !== 0) return
        const [xx, yy, w, h] = getWall(x, y)
        collideWall(thing, xx, yy, w, h)
      })
    })
  }

  addTile (x:number, y:number) {
    setGridItem(this.walls, x, y, 0)
  }

  charThrow () {
    console.log(this.guy, this.guy.facing)
  }
}

