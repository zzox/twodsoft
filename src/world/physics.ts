import { Actor, vec3 } from '../scenes/test-scene'

export const updatePhysics = (actor:Actor) => {
  actor.last.x = actor.pos.x
  actor.last.y = actor.pos.y
  actor.pos.x += actor.vel.x
  actor.pos.y += actor.vel.y
}

// Returns true if two physics bodies overlap.
export const overlaps = (x1:number, y1:number, w1:number, h1:number, x2:number, y2:number, w2:number, h2:number):boolean =>
  x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2

export const collideWall = (actor:Actor, wx:number, wy:number, ww:number, wh:number) => {
  if (overlaps(actor.pos.x, actor.pos.y, actor.size.x, actor.size.y, wx, wy, ww, wh)) {   
    console.log('collide', checkDirectionalCollision(actor, { pos: vec3(wx, wy, 0), size: vec3(ww, wh, 16)} as Actor, true))
  }
}

const checkDirectionalCollision = (fromActor:Actor, intoActor:Actor, separates:boolean):boolean => {
  var collided = false
  const upCollide = checkUp(fromActor, intoActor, separates)
  if (upCollide) {
    collided = true
    // return true
  }

  const downCollide = checkDown(fromActor, intoActor, separates)
  if (downCollide) {
    collided = true
    // return true
  }

  const leftCollide = checkLeft(fromActor, intoActor, separates)
  if (leftCollide) {
    collided = true
    // return true
  }

  const rightCollide = checkRight(fromActor, intoActor, separates)
  if (rightCollide) {
    collided = true
    // return true
  }

  return collided
}

const checkUp = (fromActor:Actor, intoActor:Actor, separates:boolean):boolean => {
  if (/* fromActor.collides.up && intoActor.collides.down
    && */ fromActor.last.y >= intoActor.pos.y + intoActor.size.y
    && fromActor.pos.y < intoActor.pos.y + intoActor.size.y) {
    // fromActor.touching.up = true
    if (separates) {
      separateUp(fromActor, intoActor)
    }
    return true
  }

  return false
}

const checkDown = (fromActor:Actor, intoActor:Actor, separates:boolean):boolean => {
  if (/* fromActor.collides.down && intoActor.collides.up
    && */ fromActor.last.y + fromActor.size.y <= intoActor.pos.y
    && fromActor.pos.y + fromActor.size.y > intoActor.pos.y) {
    // fromActor.touching.down = true
    if (separates) {
      separateDown(fromActor, intoActor)
    }
    return true
  }

  return false
}

const checkLeft = (fromActor:Actor, intoActor:Actor, separates:boolean):boolean => {
  if (/* fromActor.collides.left && intoActor.collides.right
    && */ fromActor.last.x >= intoActor.pos.x + intoActor.size.x
    && fromActor.pos.x < intoActor.pos.x + intoActor.size.x) {
    // fromActor.touching.left = true
    if (separates) {
      separateLeft(fromActor, intoActor)
    }
    return true
  }

  return false
}

const checkRight = (fromActor:Actor, intoActor:Actor, separates:boolean):boolean => {
  if (/* fromActor.collides.right && intoActor.collides.left
    && */ fromActor.last.x + fromActor.size.x <= intoActor.pos.x
    && fromActor.pos.x + fromActor.size.x > intoActor.pos.x) {
    // fromActor.touching.right = true
    if (separates) {
      separateRight(fromActor, intoActor)
    }
    return true
  }

  return false
}

// remove fromActor from intoActor
const separateUp = (fromActor:Actor, intoActor:Actor) => {
  fromActor.pos.y = intoActor.pos.y + intoActor.size.y
  fromActor.vel.y = -fromActor.vel.y * 0 // fromActor.bounce
}

const separateDown = (fromActor:Actor, intoActor:Actor) => {
  fromActor.pos.y = intoActor.pos.y - fromActor.size.y
  fromActor.vel.y = -fromActor.vel.y * 0 // fromActor.bounce
}

const separateLeft = (fromActor:Actor, intoActor:Actor) => {
  fromActor.pos.x = intoActor.pos.x + intoActor.size.x
  fromActor.vel.x = -fromActor.vel.x * 0 // fromActor.bounce
}

const separateRight = (fromActor:Actor, intoActor:Actor) => {
  fromActor.pos.x = intoActor.pos.x - fromActor.size.x
  fromActor.vel.x = -fromActor.vel.x * 0 // fromActor.bounce
}
