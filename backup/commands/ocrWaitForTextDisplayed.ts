import { Rectangles, ScreenSize } from '../typings/types'
import ocrGetText from './ocrGetText'

interface OcrWaitForTextDisplayedOptions {
  androidRectangles?: Rectangles;
  iOSRectangles?: Rectangles;
  isTesseractAvailable: boolean;
  ocrImagesPath: string;
  language: string;
  screenSize: ScreenSize;
  text: string;
  timeout?: number;
  timeoutMsg?: string;
}

export default async function ocrWaitForTextDisplayed(
  options: OcrWaitForTextDisplayedOptions
) {
  const { timeout, timeoutMsg } = options

  return driver.waitUntil(
    async () => {
      const { androidRectangles, iOSRectangles, isTesseractAvailable, language, ocrImagesPath, screenSize, text } = options

      return (
        await ocrGetText({
          androidRectangles,
          iOSRectangles,
          isTesseractAvailable,
          language,
          ocrImagesPath,
          // Always use a clean OCR
          reuseOcr: false,
          screenSize,
        })
      ).includes(text)
    },
    {
      timeout: timeout || 180000,
      timeoutMsg:
        timeoutMsg ||
        `Could not find the text "${options.text}" within the requested time.`,
    }
  )
}