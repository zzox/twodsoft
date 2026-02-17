import { keys } from './core/keys'
import { Scene } from './scenes/test-scene'
import { Debug } from './util/debug'
import { average } from './util/utils'
import { clear, setContext, setImage } from './core/draw'

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
let scene:Scene

const update = () => {
  const updateStart = performance.now()

  scene.update()

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
  scene.draw()

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
  const image = new Image()
  image.src = './assets/tiles.png'
  setImage(image)
  setContext(canvas.getContext('2d')!)

  // const grid = makeGrid(11, 11)

  // from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
  // await Promise.all(
  //   Array.from(document.images).map(
  //     (image) =>
  //       new Promise((resolve) => image.addEventListener('load', resolve)),
  //   ),
  // );

  document.onkeydown = (event:KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault()
        break
      case 'd':
        Debug.on = !Debug.on
        break
    }
    keys.set(event.key, true)
  }
  document.onkeyup = (event:KeyboardEvent) => {
    // event.preventDefault()
    keys.set(event.key, false)
  }

  Debug.renderTimes = [...new Array(300)].map(_ => 0) // 5 seconds on 60fps monitors
  Debug.updateTimes = [...new Array(300)].map(_ => 0) // ~5 seconds

  image.addEventListener('load', ready)

  window.onresize = resizeCanvas
  resizeCanvas()

  scene = new Scene()
  scene.create()
}

run()
