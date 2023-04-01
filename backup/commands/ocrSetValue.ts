import { Rectangles, ScreenSize } from '../typings/types'
import ocrKeys from '../utils/ocrKeys'
import ocrClickOnText from './ocrClickOnText'

interface OcrSetValueOptions {
  androidRectangles?: Rectangles;
  iOSRectangles?: Rectangles;
  isTesseractAvailable: boolean;
  language: string;
  reuseOcr: boolean;
  ocrImagesPath: string;
  screenSize: ScreenSize;
  text: string;
  value: string;
  clickDuration?: Number;
}

export default async function ocrSetValue(options: OcrSetValueOptions): Promise<void> {
  const {
    androidRectangles,
    iOSRectangles,
    isTesseractAvailable,
    language,
    reuseOcr,
    ocrImagesPath,
    screenSize,
    text,
    value,
    clickDuration
  } = options

  await ocrClickOnText({
    androidRectangles,
    iOSRectangles,
    isTesseractAvailable,
    language,
    ocrImagesPath,
    reuseOcr,
    screenSize,
    text,
    clickDuration
  })
  await driver.waitUntil(
    async () => driver.isKeyboardShown(),
    {
      timeout: 15000,
      timeoutMsg: 'Keyboard was not hidden',
    })
  await ocrKeys(value)
  await driver.hideKeyboard()
  await driver.waitUntil(
    async () => !(await driver.isKeyboardShown()),
    {
      timeout: 15000,
      timeoutMsg: 'Keyboard is still shown',
    })
}