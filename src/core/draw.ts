import { Height, TileSize, TileWidth, Width } from './const'

let context:CanvasRenderingContext2D
let image:HTMLImageElement

export const setContext = (ctx:CanvasRenderingContext2D) => context = ctx

export const setImage = (img:HTMLImageElement) => image = img

export const drawTile = (fromIndex:number, x:number, y:number) => {
  const tRowWidth = (image.width / TileSize)
  const tRow = fromIndex % tRowWidth
  const tColumn = Math.floor(fromIndex / tRowWidth)

  context.drawImage(image,
    tRow * TileSize, tColumn * TileSize, TileSize, TileSize,
    x, y, TileSize, TileSize
  )
}

export const drawSprite = (x:number, y:number, index:number, width = 16, height = 16) => {
  const tRowWidth = (image.width / width)
  const tRow = index % tRowWidth
  const tColumn = Math.floor(index / tRowWidth)

  context.drawImage(image,
    tRow * width, tColumn * height, width, height,
    x, y, width, height
  )
}

export const drawDebug = (x:number, y:number, width:number, height:number, fillColor:string = '#ff00ff') => {
  context.fillStyle = fillColor
  context.globalAlpha = 0.5
  context.fillRect(x, y, width, height)
  context.globalAlpha = 1.0
}

export const clear = (bgColor:string = 'black') => {
  // context.clearRect
  context.fillStyle = bgColor
  context.fillRect(0, 0, Width, Height)
}
