
import { writeFileSync } from 'fs'
import { chromium, test, expect } from '@playwright/test';
import { join } from 'path'
import Jimp from 'jimp'
import { getScreenshotSize } from './main'
import { GetOcrData, Rectangles, ScreenSize } from '../typings/types'
import createImage from './createImage'
import { SERVICE_NAME } from './constants'
import { getNodeOcrData, getSystemOcrData } from './tesseract'

interface OcrGetDataOptions {
  androidRectangles?: Rectangles;
  iOSRectangles?: Rectangles;
  isTesseractAvailable: boolean;
  language: string;
  ocrImagesPath: string;
  reuseOcr: boolean;
  screenSize: ScreenSize;
}

interface OcrGetData extends GetOcrData {
  dpr: number;
}


// @TODO: fix output
export default async function ocrGetData(options: OcrGetDataOptions): Promise<OcrGetData> {
  const {
    androidRectangles,
    iOSRectangles,
    isTesseractAvailable,
    language,
    ocrImagesPath,
    reuseOcr,
    screenSize,
  } = options

  // @TODO: fix this typing
  // @ts-ignore
  if (!reuseOcr || !ocrData) {
    try {
      // Take a screenshot
      const { height, width } = getScreenshotSize(screenshot)
      const dpr = width / screenSize.width

      // Make it grey which will be better for OCR
      const image = await Jimp.read(Buffer.from(screenshot, 'base64'))
      image.greyscale()
      image.contrast(1)
      const greyscaleImage = (await image.getBufferAsync(Jimp.MIME_PNG)).toString('base64')

      // Store it
      const fileName = `${new Date().getTime()}.png`
      const filePath = join(ocrImagesPath, fileName)
      writeFileSync(filePath, greyscaleImage, { encoding: 'base64' })

      // Crop the image on the original canvas if needed so OCR will be more accurate

        await createImage({
          filePath,
          height,
          width,
          ...iOSRectangles,
        })

      // OCR the image
      let ocrData: any
      const start = process.hrtime()

      if (isTesseractAvailable) {
        console.log('Using system installed version of Tesseract')
        ocrData = await getSystemOcrData({ filePath, language: language })
      } else {
        console.log('Using NodeJS version of Tesseract')
        ocrData = await getNodeOcrData({ filePath, language: language })
      }

      const diff = process.hrtime(start)
      const processTime = ((diff[0] * 1000000 + diff[1] / 1000) / 1000000).toFixed(3)

      console.log(`It took '${processTime}s' to process the image.`)
      console.log(
        `The following text was found through OCR:\n\n${ocrData.text.replace(
          /[\r\n]{2,}/g,
          '\n'
        )}`
      )

      // Overwrite image with the found locations
      await createImage({
        filePath,
        height,
        lines: ocrData.lines,
        width,
      })

      console.log(`OCR Image with found text can be found here:\n\n${filePath}`)

      const parsedOcrData = {
        ...ocrData,
        ...{ dpr },
      }

      // @TODO: fix this typing
      // @ts-ignore
      ocrData = parsedOcrData

      return parsedOcrData
    } catch (e) {
      throw new Error(e)
    }
  }

  // @TODO: fix this typing
  // @ts-ignore
  return ocrData
}
