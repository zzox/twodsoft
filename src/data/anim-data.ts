import { Thing, ThingState, ThingType } from './actor-data'

type Anim = {
  repeats:boolean
  frames:number[]
  speed:number
}

const anims = new Map<ThingType, Map<ThingState, Anim>>()

const ballAnims = new Map()
ballAnims.set(ThingState.None, { repeats: false, frames: [0], speed: 1 })
ballAnims.set(ThingState.Moving, { repeats: true, frames: [0, 1], speed: 5 })
anims.set(ThingType.Rock, ballAnims)

export const getAnim = (thing:Thing):number => {
  const anim = anims.get(thing.type)!.get(thing.state)!
  if (anim.repeats) {
    return thing.type + anim.frames[Math.floor(thing.stateTime / anim.speed) % anim.frames.length]
  } else {
    return thing.type + anim.frames[Math.min(Math.floor(thing.stateTime / anim.speed), anim.frames.length - 1)]
  }
}

export { anims }
