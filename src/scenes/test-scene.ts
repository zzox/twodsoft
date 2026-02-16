import { TileHeight, TileWidth } from '../core/const'
import { drawSprite, drawTile } from '../core/draw'
import { keys } from '../core/keys'

type Guy = {
  vec:Vec3
  facing:FacingDir
}

const newGuy = (vec:Vec3) => ({ vec, facing: FacingDir.Down })

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

const vec3 = (x:number, y:number, z:number):Vec3 => ({ x, y, z })

const bgColor = 'black'

export class Scene {
  guy:Guy

  constructor () {
    this.guy = newGuy(vec3(100, 80, 12))
  }

  create () {
    console.log('we here')
  }

  update () {
    if (keys.get('ArrowUp')) {
      this.guy.vec.y -= 1
      this.guy.facing = FacingDir.Up
    }

    if (keys.get('ArrowDown')) {
      this.guy.vec.y += 1
      this.guy.facing = FacingDir.Down
    }

    if (keys.get('ArrowLeft')) {
      this.guy.vec.x -= 1
      this.guy.facing = FacingDir.Left
    }

    if (keys.get('ArrowRight')) {
      this.guy.vec.x += 1
      this.guy.facing = FacingDir.Right
    }
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
    drawSprite(this.guy.vec.x, this.guy.vec.y, 12 + this.guy.facing)
  }
}

