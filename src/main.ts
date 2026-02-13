const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')!

const width = 240
const height = 160

let image:HTMLImageElement

console.log('we are alive', context)

const bgColor = 'black'

const clear = () => {
  // context.clearRect
  context.fillStyle = bgColor
  context.fillRect(0, 0, width, height)
}

const update = () => {}

const draw = () => {
  clear()
  context.drawImage(image, Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))
}

let acc = 0
let prev = 0

let fps = 30
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

  // specific sizing for mobile
  // const availW = document.body.getBoundingClientRect().width < 800
  //   ? document.body.getBoundingClientRect().width
  //   // smallest width on 40 percent
  //   : Math.min(canvas.parentElement!.getBoundingClientRect().width, document.body.getBoundingClientRect().width * .4)
  
  // const availH = document.body.getBoundingClientRect().width < 800
  //   ? 612
  //   : canvas.parentElement!.getBoundingClientRect().height
  
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

//   document.onkeydown = (event:KeyboardEvent) => {
//     if (event.key === 'f') {
//       fastForward = true
//     } else if (event.key === 'g') {
//       fastForward2 = true
//     }
//   }
//   document.onkeyup = (event:KeyboardEvent) => {
//     if (event.key === 'f') {
//       fastForward = false
//     } else if (event.key === 'g') {
//       fastForward2 = false
//     }
//   }

  image.addEventListener('load', ready)

  window.onresize = resizeCanvas
  resizeCanvas()
}

run()
