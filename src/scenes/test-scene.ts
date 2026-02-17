import { TileHeight, TileSize, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug } from '../core/draw'
import { keys } from '../core/keys'
import { Debug } from '../util/debug'
import { forEachGI, makeGrid, setGridItem } from '../world/grid'
import { collideWall, updatePhysics } from '../world/physics'
import { Grid } from '../world/grid'
import { FacingDir, vec2, vec3 } from '../types'
import { Actor, newActor, newThing, Thing } from '../data/actor-data'

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
  actors:Actor[] = []
  things:Thing[] = []
  // walls:number[] = []

  walls:Grid<number>

  // TEMP
  // colliding = false

  constructor () {
    this.guy = newActor(vec3(100, 80, 12), vec2(4, 8))
    this.actors.push(this.guy)

    const ball = newThing(vec3(100, 80, 4), vec2(6, 6))
    this.things.push(ball)

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

    const speed = xvel !== 0 && yvel !== 0 ? diagVel : vel
    this.guy.vel.x = xvel * speed
    this.guy.vel.y = yvel * speed

    this.actors.forEach(actor => {
      updatePhysics(actor)
    })

    this.things.forEach(thing => {
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

    this.actors.forEach(actor => {
      drawSprite(Math.floor(actor.pos.x) - actor.offset.x, Math.floor(actor.pos.y) - actor.offset.y, 64 + actor.facing)
    })

    this.things.forEach(thing => {
      drawSprite(Math.floor(thing.pos.x) - thing.offset.x, Math.floor(thing.pos.y) - thing.offset.y, 192)
    })

    if (Debug.on) {
      this.actors.forEach(actor => {
        drawDebug(Math.floor(actor.pos.x), Math.floor(actor.pos.y), actor.size.x, actor.size.y)
      })
    }
  }

  checkCollisions () {
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
}

