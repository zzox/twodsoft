import { Thing } from '../data/actor-data'
import { Collides, vec3 } from '../types'
import { toRadian } from '../util/utils'

// TODO: get from const
const fps = 60
const gravity = 120

export const updatePhysics = (thing:Thing) => {
  thing.last.x = thing.pos.x
  thing.last.y = thing.pos.y
  thing.zVel -= (120 / fps) * thing.gravityFactor

  const velX = thing.vel * 1.5 * Math.cos(toRadian(thing.angle))
  const velY = thing.vel * Math.sin(toRadian(thing.angle))

  thing.pos.x += velX / fps
  thing.pos.y += velY / fps
  thing.pos.z += thing.zVel / fps
}

// Returns true if two physics bodies overlap.
export const overlaps = (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number, w2:number, h2:number):boolean =>
  x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2
  // x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2 <- seam clips

// Returns true if there's a collision
export const collideWall = (actor:Thing, wx:number, wy:number, ww:number, wh:number, wallCollides:Collides):boolean => {
  if (overlaps(actor.pos.x, actor.pos.y, actor.size.x, actor.size.y, wx, wy, ww, wh)) {   
    return checkDirectionalCollision(actor, { pos: vec3(wx, wy, 0), size: vec3(ww, wh, 16) } as Thing, true, wallCollides)
  }
  return false
}

const checkDirectionalCollision = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  var collided = false
  const upCollide = checkUp(fromThing, intoThing, separates, intoCollides)
  if (upCollide) {
    collided = true
    // return true
  }

  const downCollide = checkDown(fromThing, intoThing, separates, intoCollides)
  if (downCollide) {
    collided = true
    // return true
  }

  const leftCollide = checkLeft(fromThing, intoThing, separates, intoCollides)
  if (leftCollide) {
    collided = true
    // return true
  }

  const rightCollide = checkRight(fromThing, intoThing, separates, intoCollides)
  if (rightCollide) {
    collided = true
    // return true
  }

  return collided
}

const checkUp = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.up && */ intoCollides.down
    && fromThing.last.y >= intoThing.pos.y + intoThing.size.y
    && fromThing.pos.y < intoThing.pos.y + intoThing.size.y) {
    // fromThing.touching.up = true
    if (separates) {
      separateUp(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkDown = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.down && */ intoCollides.up
    && fromThing.last.y + fromThing.size.y <= intoThing.pos.y
    && fromThing.pos.y + fromThing.size.y > intoThing.pos.y) {
    // fromThing.touching.down = true
    if (separates) {
      separateDown(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkLeft = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.left && */ intoCollides.right
    && fromThing.last.x >= intoThing.pos.x + intoThing.size.x
    && fromThing.pos.x < intoThing.pos.x + intoThing.size.x) {
    // fromThing.touching.left = true
    if (separates) {
      separateLeft(fromThing, intoThing)
    }
    return true
  }

  return false
}

const checkRight = (fromThing:Thing, intoThing:Thing, separates:boolean, intoCollides:Collides):boolean => {
  if (/* fromThing.collides.right && */ intoCollides.left
    && fromThing.last.x + fromThing.size.x <= intoThing.pos.x
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
  fromThing.vel = fromThing.vel * fromThing.bounce
  fromThing.angle = -fromThing.angle
}

const separateDown = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.y = intoThing.pos.y - fromThing.size.y
  fromThing.vel = fromThing.vel * fromThing.bounce
  fromThing.angle = -fromThing.angle
}

const separateLeft = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x + intoThing.size.x
  fromThing.vel = fromThing.vel * fromThing.bounce
  fromThing.angle = 180 - fromThing.angle
}

const separateRight = (fromThing:Thing, intoThing:Thing) => {
  fromThing.pos.x = intoThing.pos.x - fromThing.size.x
  fromThing.vel = fromThing.vel * fromThing.bounce
  fromThing.angle = 180 - fromThing.angle
}
