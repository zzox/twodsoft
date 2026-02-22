import { clone3, FacingDir, vec2, Vec2, vec3, Vec3 } from '../types'

// tile index of the thing
export enum ThingType {
  Rock = 192,
  Guy = 64
}

export enum ThingState {
  None,
  Moving,
  // player
  PreThrow,
  Throw
}

type PhysicsObject = {
  pos:Vec3
  last:Vec3
  vel:number
  zVel:number
  angle:number
  size:Vec3
  gravityFactor:number
}

// thing is a physical object that can move.
export type Thing = PhysicsObject & {
  dead:boolean
  health:number
  type:ThingType
  state:ThingState
  stateTime:number
  offset:Vec2
  bounce:number
  held:boolean
}

// actor is a thing that is alive
export type Actor = Thing & {
  isActor:true,
  facing:FacingDir
  holding?:Thing
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
  vel: 0,
  zVel: 0,
  angle: 0,
  gravityFactor: 1,
  bounce: 0,
  state: ThingState.None,
  stateTime: 0,
  health: 10,
  dead: false,
  held: false,
  isActor: true
})

export const newThing = (pos:Vec3, angle:number, held:boolean = false, vel?:number, zVel?:number):Thing => ({
  type: ThingType.Rock,
  pos,
  size: vec3(3, 3, 3),
  last: clone3(pos),
  offset: vec2(6, 6),
  vel: vel || 0,
  zVel: zVel || 0,
  angle,
  gravityFactor: 1,
  bounce: 0.8,
  state: held ? ThingState.None : ThingState.Moving,
  stateTime: 0,
  health: 5,
  dead: false,
  held
})

export const centerX = (thing:Thing):number => thing.pos.x + thing.size.x / 2
export const centerY = (thing:Thing):number => thing.pos.y + thing.size.y / 2
export const bottomY = (thing:Thing):number => thing.pos.y + thing.size.y

export const throwPos = (actor:Actor):Vec3 => {
  switch (actor.facing) {
    case FacingDir.Left: return vec3(centerX(actor) - 6, centerY(actor) - 6, actor.pos.z + 6)
    case FacingDir.Right: return vec3(centerX(actor) + 6, centerY(actor) + 6, actor.pos.z + 6)
    case FacingDir.Up: return vec3(centerX(actor) + 6, centerY(actor) - 6, actor.pos.z + 6)
    case FacingDir.Down: return vec3(centerX(actor) - 6, centerY(actor) + 6, actor.pos.z + 6)
    default: throw new Error('Bad facing dir')
  }
}

export const holdPos = (actor:Actor):Vec3 => {
  switch (actor.facing) {
    case FacingDir.Left: return vec3(centerX(actor), centerY(actor) - 6, actor.pos.z + 6)
    case FacingDir.Right: return vec3(centerX(actor), centerY(actor) + 6, actor.pos.z + 6)
    case FacingDir.Up: return vec3(centerX(actor) + 6, centerY(actor), actor.pos.z + 6)
    case FacingDir.Down: return vec3(centerX(actor) - 6, centerY(actor), actor.pos.z + 6)
    default: throw new Error('Bad facing dir')
  }
}

export const facingAngle = (facing:FacingDir):number => {
  switch (facing) {
    case FacingDir.Left: return 180
    case FacingDir.Right: return 0
    case FacingDir.Up: return 270
    case FacingDir.Down: return 90
    default: throw new Error('Bad facing dir')
  }
}

export const setState = (thing:Thing, state:ThingState) => {
  thing.stateTime = 0
  thing.state = state
}
