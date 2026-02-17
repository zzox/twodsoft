import { TileHeight, TileSize, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug } from '../core/draw'
import { keys } from '../core/keys'
import { Debug } from '../util/debug'
import { forEachGI, makeGrid, setGridItem } from '../world/grid'
import { collideWall, updatePhysics } from '../world/physics'
import { Grid } from '../world/grid'

enum FacingDir {
  Left,
  Right,
  Up,
  Down
}

type Vec3 = {
  x:number
  y:number
  z:number
}

type Vec2 = {
  x:number
  y:number
}

export const vec3 = (x:number, y:number, z:number):Vec3 => ({ x, y, z })
const vec2 = (x:number, y:number):Vec2 => ({ x, y })

const clone3 = (vec:Vec3) => vec3(vec.x, vec.y, vec.z)

// TODO: move to actors data
export type Actor = {
  offset:Vec2
  pos:Vec3
  last:Vec3
  vel:Vec3
  size:Vec3
  facing:FacingDir
}

// type Wall = {
//   // size:Vec3 <- all are asummed 16x16
//   pos:Vec3
// }

const newActor = (pos:Vec3, offset:Vec2) => ({ pos, facing: FacingDir.Down, size: vec3(8, 8, 8), last: clone3(pos), offset, vel: vec3(0, 0, 0) })

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
  // walls:number[] = []

  walls:Grid<number>

  // TEMP
  // colliding = false

  constructor () {
    this.guy = newActor(vec3(100, 80, 12), vec2(4, 8))
    this.actors.push(this.guy)

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
    this.guy.vel.x = xvel * speed / 60
    this.guy.vel.y = yvel * speed / 60

    this.actors.forEach(actor => {
      updatePhysics(actor)
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

    if (Debug.on) {
      this.actors.forEach(actor => {
        drawDebug(Math.floor(actor.pos.x), Math.floor(actor.pos.y), actor.size.x, actor.size.y)
      })
    }
  }

  checkCollisions () {
    forEachGI(this.walls, (x, y, wall) => {
      if (wall !== 0) return
      const [xx, yy, w, h] = getWall(x, y)
      collideWall(this.guy, xx, yy, w, h)
    })
  }

  addTile (x:number, y:number) {
    setGridItem(this.walls, x, y, 0)
  }
}

