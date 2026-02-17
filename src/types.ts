export enum FacingDir {
  Left,
  Right,
  Up,
  Down
}

export type Vec3 = {
  x:number
  y:number
  z:number
}

export type Vec2 = {
  x:number
  y:number
}

export const vec3 = (x:number, y:number, z:number):Vec3 => ({ x, y, z })
export const vec2 = (x:number, y:number):Vec2 => ({ x, y })

export const clone3 = (vec:Vec3) => vec3(vec.x, vec.y, vec.z)
