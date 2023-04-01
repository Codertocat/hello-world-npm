import { ClickPoint, DetermineClickPointOptions, Rectangles, ScreenSize, } from '../typings/types'

/**
 * Get the size of a screenshot in pixels
 */
export function getScreenshotSize(screenshot: string): ScreenSize {
  return {
    height: Buffer.from(screenshot, 'base64').readUInt32BE(20),
    width: Buffer.from(screenshot, 'base64').readUInt32BE(16),
  }
}

export function getDprPositions(values: Rectangles, dpr: number): Rectangles {
  Object.keys({ ...values }).map((value: string) => {
    // @ts-ignore
    values[value] /= dpr
  })

  return values
}

/**
 * Determine the click point
 */
export function determineClickPoint(options: DetermineClickPointOptions): ClickPoint {
  const { rectangles: { left, right, top, bottom } } = options
  const x = Math.round( left + (right - left) / 2 )
  const y = Math.round( top + (bottom - top) / 2 )

  return { x, y }
}

export function parseAttributeString(
  attributes: string[]
): { bbox: Rectangles; wc: number } {
  let bbox = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }
  let wc = 0

  attributes.forEach((attribute: string) => {
    if (attribute.includes('bbox')) {
      const bboxValues = attribute.replace('bbox ', '').split(' ')
      bbox = {
        left: Number(bboxValues[0]),
        top: Number(bboxValues[1]),
        right: Number(bboxValues[2]),
        bottom: Number(bboxValues[3]),
      }
    } else if (attribute.includes('x_wconf')) {
      const score = attribute.replace('x_wconf ', '')
      wc = Number(score) / 100
    }
  })

  return {
    ...{ bbox },
    wc,
  }
}
