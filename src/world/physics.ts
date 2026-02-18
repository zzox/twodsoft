import { Thing } from '../data/actor-data'
import { vec3 } from '../types'

// TODO: get from const
const fps = 60

export const updatePhysics = (thing:Thing) => {
  thing.last.x = thing.pos.x
  thing.last.y = thing.pos.y
  thing.vel.z -= (60 / fps) * thing.gravityFactor
  thing.pos.x += thing.vel.x / fps
  thing.pos.y += thing.vel.y / fps
  thing.pos.z += thing.vel.z / fps
}

// Returns true if two physics bodies overlap.
export const overlaps = (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number, w2:number, h2:number):boolean =>
  x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2
  // x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2 <- seam clips

// Returns true if there's a collision
export const collideWall = (actor:Thing, wx:number, wy:number, ww:number, wh:number):boolean => {
  if (overlaps(actor.pos.x, actor.pos.y, actor.size.x, actor.size.y, wx, wy, ww, wh)) {   
    return checkDirectionalCollision(actor, { pos: vec3(wx, wy, 0), size: vec3(ww, wh, 16)} as Thing, true)
  }
  return false
}

const checkDirectionalCollision = (fromThing:Thing, intoThing:Thing, separates:boolean):boolean => {
  var collided = false
  const upCollide = checkUp(fromThing, intoThing, separates)
  if (upCollide) {
    collided = true
    // return true
  }

  const downCollide = checkDown(fromThing, intoThing, separates)
  if (downCollide) {
    collided = true
    // return true
  }

  const leftCollide = checkLeft(fromThing, intoThing, separates)
  if (leftCollide) {
    collided = true
    // return true
  }

  const rightCollide = checkRight(fromThing, intoThing, separates)
  if (rightCollide) {
    collided = true
    // return true
  }

  return collided
}

const checkUp = (fromThing:Thing, intoThing:Thing, separates:boolean):boolean => {
  if (/* fromThing.collides.up && intoThing.collides.down
    && */ fromThing.last.y >= intoThing.pos.y + intoThing.size.y
    && fromThing.pos.y < intoThing.pos.y + intoThing.size.y) {
    // fromThing.touching.up = true
    if (separates) {
      separateUp(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkDown = (fromThing:Thing, intoThing:Thing, separates:boolean):boolean => {
  if (/* fromThing.collides.down && intoThing.collides.up
    && */ fromThing.last.y + fromThing.size.y <= intoThing.pos.y
    && fromThing.pos.y + fromThing.size.y > intoThing.pos.y) {
    // fromThing.touching.down = true
    if (separates) {
      separateDown(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkLeft = (fromThing:Thing, intoThing:Thing, separates:boolean):boolean => {
  if (/* fromThing.collides.left && intoThing.collides.right
    && */ fromThing.last.x >= intoThing.pos.x + intoThing.size.x
    && fromThing.pos.x < intoThing.pos.x + intoThing.size.x) {
    // fromThing.touching.left = true
    if (separates) {
      separateLeft(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkRight = (fromThing:Thing, intoThing:Thing, separates:boolean):boolean => {
  if (/* fromThing.collides.right && intoThing.collides.left
    && */ fromThing.last.x + fromThing.size.x <= intoThing.pos.x
    && fromThing.pos.x + fromThing.size.x > intoThing.pos.x) {
    // fromThing.touching.right = true
    if (separates) {
      separateRight(fromThing, intoThing)
    }
    return true
  }

  return false
}

// remove fromThing from intoThing
const separateUp = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.y = intoThing.pos.y + intoThing.size.y
  fromThing.vel.y = -fromThing.vel.y * fromThing.bounce
}

const separateDown = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.y = intoThing.pos.y - fromThing.size.y
  fromThing.vel.y = -fromThing.vel.y * fromThing.bounce
}

const separateLeft = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x + intoThing.size.x
  fromThing.vel.x = -fromThing.vel.x * fromThing.bounce
}

const separateRight = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x - fromThing.size.x
  fromThing.vel.x = -fromThing.vel.x * fromThing.bounce
}
