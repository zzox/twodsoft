import { Debug } from './util/debug'
import { average } from './util/utils'

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')!

const width = 240
const height = 160

const TileSize = 16

const tileWidth = width / TileSize
const tileHeight = height / TileSize

let image:HTMLImageElement

const keys = new Map<string, boolean>()

const Guy = (vec:Vec3) => ({ vec, facing: FacingDir.Down })

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

const guy = Guy(vec3(100, 80, 12))

console.log('we are alive', context)

const bgColor = 'black'

const drawTile = (fromIndex:number, toIndex:number) => {
  const tRowWidth = (image.width / TileSize)
  const tRow = fromIndex % tRowWidth
  const tColumn = Math.floor(fromIndex / tRowWidth)

  const row = toIndex % tileWidth
  const column = Math.floor(toIndex / tileWidth)

  context.drawImage(image,
    tRow * TileSize, tColumn * TileSize, TileSize, TileSize,
    row * TileSize, column * TileSize, TileSize, TileSize
  )
}

const drawSprite = (x:number, y:number, index:number, width = 16, height = 16) => {
  const tRowWidth = (image.width / width)
  const tRow = index % tRowWidth
  const tColumn = Math.floor(index / tRowWidth)

  context.drawImage(image,
    tRow * width, tColumn * height, width, height,
    x, y, width, height
  )
}

const clear = () => {
  // context.clearRect
  context.fillStyle = bgColor
  context.fillRect(0, 0, width, height)
}

const update = () => {
  const updateStart = performance.now()
  ////////////////////////////////
  ////     Updates go here    ////
  ////////////////////////////////

  if (keys.get('ArrowUp')) {
    guy.vec.y -= 1
    guy.facing = FacingDir.Up
  }

  if (keys.get('ArrowDown')) {
    guy.vec.y += 1
    guy.facing = FacingDir.Down
  }

  if (keys.get('ArrowLeft')) {
    guy.vec.x -= 1
    guy.facing = FacingDir.Left
  }

  if (keys.get('ArrowRight')) {
    guy.vec.x += 1
    guy.facing = FacingDir.Right
  }

  if (Math.random() < 0.01) {
    console.log(`FPS: ${Debug.renderFrames.length}, avg: ${Math.round(average(Debug.renderTimes) * 1000)}us`)
    console.log(`UPS: ${Debug.updateFrames.length}, avg: ${Math.round(average(Debug.updateTimes) * 1000)}us`)
  }

  const time = performance.now()
  const updateTime = time - updateStart
  Debug.updateTimes.push(updateTime)
  Debug.updateTimes.shift()

  Debug.updateFrames.push(time)
  while (true) {
    if (Debug.updateFrames[0] && Debug.updateFrames[0] < time - 999) {
      Debug.updateFrames.shift()
    } else {
      break
    }
  }
}

const draw = () => {
  const renderStart = performance.now()

  clear()
  for (let i = 0; i < tileWidth; i++) {
    drawTile(0, i)
    drawTile(0, (tileHeight - 1) * tileWidth + i)
  }

  for (let i = 0; i < tileHeight; i++) {
    drawTile(0, tileWidth * i)
    drawTile(0, tileWidth * i - 1)
  }

  drawSprite(guy.vec.x, guy.vec.y, 12 + guy.facing)

  // context.drawImage(image, Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))

  const time = performance.now()
  const renderTime = time - renderStart
  Debug.renderTimes.push(renderTime)
  Debug.renderTimes.shift()

  Debug.renderFrames.push(time)
  while (true) {
    if (Debug.renderFrames[0] && Debug.renderFrames[0] < time - 999) {
      Debug.renderFrames.shift()
    } else {
      break
    }
  }
}

let acc = 0
let prev = 0

let fps = 60
let frameTime = 1000 / fps

const next = (time:number) => {
  const delta = time - prev
  acc += delta

  if (acc > frameTime) {
    update()
    draw()
    acc -= frameTime
  }

  requestAnimationFrame(next)
  prev = time
}

const ready = () => {
  next(0)
}

const resizeCanvas = () => {
  const maxMulti = 20
  const w = canvas.width
  const h = canvas.height
  // overflow pixels
  const padding = 0
  
  const availW = canvas.parentElement!.getBoundingClientRect().width
  const availH = canvas.parentElement!.getBoundingClientRect().height

  const maxW = Math.floor(availW / (w - padding))
  const maxH = Math.floor(availH / (h - padding))
  // lower than maxMultiplier, but at least two
  const multi = Math.max(Math.min(Math.min(maxW, maxH), maxMulti), 2)

  canvas.style.width = `${multi * w}px`
  canvas.style.height = `${multi * h}px`
}

const run = async () => {
  image = new Image()
  image.src = './assets/tiles.png'

  // const grid = makeGrid(11, 11)

  // from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
  // await Promise.all(
  //   Array.from(document.images).map(
  //     (image) =>
  //       new Promise((resolve) => image.addEventListener('load', resolve)),
  //   ),
  // );

  document.onkeydown = (event:KeyboardEvent) => {
    event.preventDefault()
    keys.set(event.key, true)
  }
  document.onkeyup = (event:KeyboardEvent) => {
    event.preventDefault()
    keys.set(event.key, false)
  }

  Debug.renderTimes = [...new Array(300)].map(_ => 0) // 5 seconds on 60fps monitors
  Debug.updateTimes = [...new Array(300)].map(_ => 0) // ~5 seconds

  image.addEventListener('load', ready)

  window.onresize = resizeCanvas
  resizeCanvas()
}

run()
