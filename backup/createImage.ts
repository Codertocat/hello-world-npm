// @ts-ignore
import { encodePNGToStream, decodePNGFromStream, make } from 'pureimage'
import { createReadStream, createWriteStream } from 'fs'
import { Rectangles } from '../typings/types'

interface CreateImageData {
  bottom?: number;
  filePath: string;
  height: number;
  left?: number;
  lines?: any;
  right?: number;
  top?: number;
  width: number;
}

export default async function createImage(data: CreateImageData) {
  const { bottom, filePath, height, left, lines, right, top, width } = data
  const image = await decodePNGFromStream(createReadStream(filePath))
  const canvasImage = make(width, height)
  const context = canvasImage.getContext('2d')
  const sxDx = left ? left : 0
  const syDy = top ? top : 0
  const sdHeight = bottom && (top || top === 0) ? Math.abs (bottom - top ) : height
  const sdWidth = (left || left === 0) && right ?  Math.abs (right - left ) : width

  context.drawImage(
    image,
    // Start at x/y pixels from the left and the top of the image (crop)
    sxDx, syDy,
    // 'Get' a (w * h) area from the source image (crop)
    sdWidth, sdHeight,
    // Place the result at 0, 0 in the canvas,
    // 0,0,
    sxDx, syDy,
    // With as width / height: 100 * 100 (scale)
    sdWidth, sdHeight
  )

  if (lines && lines.length > 0) {
    // Highlight all found texts
    lines.forEach(({ bbox }: { bbox: Rectangles }) => {
      const { right, bottom, left, top } = bbox

      context.beginPath()
      context.fillStyle = 'rgba(57, 170, 86, 0.5)'
      context.fillRect(left, top, Math.abs (right - left ), Math.abs(bottom - top ))
      context.lineWidth = 2
      context.strokeStyle = '#39aa56'
      context.rect(left, top, Math.abs (right - left ), Math.abs(bottom - top ))
      context.stroke()
    })
  }

  await encodePNGToStream(canvasImage, createWriteStream(filePath))
}