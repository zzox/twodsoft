import { TileHeight, TileSize, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug } from '../core/draw'
import { keys } from '../core/keys'
import { Debug } from '../util/debug'
import { collideWall, updatePhysics } from '../world/physics'

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

const getFromWallIndex = (index:number):[number, number, number, number] => {
  const column = index % TileWidth
  const row = Math.floor(index / TileWidth)
  const x = column * TileSize
  const y = row * TileSize
  const w = TileSize
  const h = TileSize

  return [x, y, w, h]
}

export class Scene {
  guy:Actor
  actors:Actor[] = []
  walls:number[] = []

  // TEMP
  // colliding = false

  constructor () {
    this.guy = newActor(vec3(100, 80, 12), vec2(4, 4))
    this.actors.push(this.guy)

    for (let i = 0; i < TileWidth; i++) {
      this.addTile(i)
      this.addTile((TileHeight - 1) * TileWidth + i)
    }

    for (let i = 0; i < TileHeight; i++) {
      this.addTile(TileWidth * i)
      this.addTile(TileWidth * i - 1)
    }
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
    this.walls.forEach(wall => {
      drawTile(0, wall)
    })

    if (Debug.on) {
      this.walls.forEach(wallIndex => {
        const [x, y, w, h] = getFromWallIndex(wallIndex)
        drawDebug(x, y, w, h, '#ff0000')
      })
    }

    this.actors.forEach(actor => {
      drawSprite(Math.floor(actor.pos.x) - actor.offset.x, Math.floor(actor.pos.y) - actor.offset.y, 12 + actor.facing)
    })

    if (Debug.on) {
      this.actors.forEach(actor => {
        drawDebug(Math.floor(actor.pos.x), Math.floor(actor.pos.y), actor.size.x, actor.size.y)
      })
    }
  }

  checkCollisions () {
    this.walls.forEach(wallIndex => {
      const [x, y, w, h] = getFromWallIndex(wallIndex)

      collideWall(this.guy, x, y, w, h)
    })
  }

  addTile (index:number) {
    this.walls.push(index)
  }
}

