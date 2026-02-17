import { TileHeight, TileWidth } from '../core/const'
import { drawSprite, drawTile, drawDebug } from '../core/draw'
import { keys } from '../core/keys'
import { Debug } from '../util/debug'

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

const vec3 = (x:number, y:number, z:number):Vec3 => ({ x, y, z })
const vec2 = (x:number, y:number):Vec2 => ({ x, y })

type Actor = {
  offset:Vec2
  vec:Vec3
  size:Vec3
  facing:FacingDir
}

const newActor = (vec:Vec3, offset:Vec2) => ({ vec, facing: FacingDir.Down, size: vec3(8, 8, 8), offset })

const vel = 60
const diagVel = vel / Math.SQRT2

export class Scene {
  guy:Actor
  actors:Actor[] = []

  constructor () {
    this.guy = newActor(vec3(100, 80, 12), vec2(4, 4))
    this.actors.push(this.guy)
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
    this.guy.vec.x += xvel * speed / 60
    this.guy.vec.y += yvel * speed / 60
  }

  draw () {
    for (let i = 0; i < TileWidth; i++) {
      drawTile(0, i)
      drawTile(0, (TileHeight - 1) * TileWidth + i)
    }

    for (let i = 0; i < TileHeight; i++) {
      drawTile(0, TileWidth * i)
      drawTile(0, TileWidth * i - 1)
    }

    this.actors.forEach(actor => {
      drawSprite(Math.floor(actor.vec.x) - actor.offset.x, Math.floor(actor.vec.y) - actor.offset.y, 12 + actor.facing)
    })

    if (Debug.on) {
      this.actors.forEach(actor => {
        drawDebug(Math.floor(actor.vec.x), Math.floor(actor.vec.y), actor.size.x, actor.size.y)
      })
    }
  }
}

