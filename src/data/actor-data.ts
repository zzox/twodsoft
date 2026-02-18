import { clone3, FacingDir, Vec2, vec3, Vec3 } from '../types'
import { randomInt } from '../util/random'

// tile index of the thing
export enum ThingType {
  Ball = 192,
  Guy = 64
}

export enum ThingState {
  None,
  Moving
}

// thing is a physical object that can move.
export type Thing = {
  type:ThingType
  state:ThingState
  stateTime:number
  offset:Vec2
  pos:Vec3
  last:Vec3
  vel:Vec3
  size:Vec3
  bounce:number
}

// actor is a thing that is alive
export type Actor = Thing & {
  facing:FacingDir
}

// type Wall = {
//   // size:Vec3 <- all are asummed 16x16
//   pos:Vec3
// }

export const newActor = (pos:Vec3, offset:Vec2):Actor => ({
  type: ThingType.Guy,
  pos,
  offset,
  facing: FacingDir.Down,
  size: vec3(8, 8, 8),
  last: clone3(pos),
  vel: vec3(0, 0, 0),
  bounce: 0,
  state: ThingState.None,
  stateTime: 0
})

export const newThing = (pos:Vec3, offset:Vec2):Thing => ({
  type: ThingType.Ball,
  pos,
  size: vec3(3, 3, 3),
  last: clone3(pos),
  offset,
  vel: vec3(randomInt(3) * 30, randomInt(3) * 30, 0),
  bounce: 1,
  state: ThingState.Moving,
  stateTime: 0
})

export const centerX = (thing:Thing):number => thing.pos.x + thing.size.x / 2
export const centerY = (thing:Thing):number => thing.pos.y + thing.size.y / 2
export const bottomY = (thing:Thing):number => thing.pos.y + thing.size.y
