import { clone3, FacingDir, Vec2, vec3, Vec3 } from '../types'

export enum ThingType {
  Ball,
  Guy
}

// thing is a physical object that can move.
export type Thing = {
  type:ThingType
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

export const newActor = (pos:Vec3, offset:Vec2):Actor => ({ type: ThingType.Guy, pos, facing: FacingDir.Down, size: vec3(8, 8, 8), last: clone3(pos), offset, vel: vec3(0, 0, 0), bounce: 0 })

export const newThing = (pos:Vec3, offset:Vec2):Thing => ({ type: ThingType.Ball, pos, size: vec3(3, 3, 3), last: clone3(pos), offset, vel: vec3(0, 30, 0), bounce: 1 })
