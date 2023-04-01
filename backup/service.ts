import type { Services } from '@wdio/types'
import { mkdirSync } from 'fs'
import ocrElementPositionByText from './commands/ocrGetElementPositionByText'
import ocrGetText from './commands/ocrGetText'
import ocrClickOnText from './commands/ocrClickOnText'
import ocrSetValue from './commands/ocrSetValue'
import {
  ClickOnTextOptions,
  ElementPositionByText,
  GetTextOptions,
  OcrServiceConfig,
  ScreenSize,
  SetValueOptions,
  WaitForTextDisplayedOptions,
} from './typings/types'
import ocrWaitForTextDisplayed from './commands/ocrWaitForTextDisplayed'
import { isTesseractAvailable } from './utils/tesseract'
import { OCR_IMAGES_PATH, SUPPORTED_LANGUAGES } from './utils/constants'

export default class OcrService implements Services.ServiceInstance {
  private _ocrImagesPath = OCR_IMAGES_PATH
  private _driver?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser

  constructor(private _options: OcrServiceConfig = {}) {
    this._ocrImagesPath = this._options.ocrImagesPath || this._ocrImagesPath

    mkdirSync(this._ocrImagesPath, { recursive: true })
  }

  async before(
    caps: WebDriver.Capabilities,
    specs: string[],
    driver: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
  ) {
    this._driver = driver

    if (this._driver.isIOS) {
      // Lower the quality so it will have better results for OCR on iOS
      await this._driver.updateSettings({ screenshotQuality: 2 })
    }

    const screenSize = await this._driver.getWindowSize() as ScreenSize
    const tesseractAvailable = isTesseractAvailable()

    this._driver.addCommand(
      'ocrGetElementPositionByText',
      (selector:string, options: ElementPositionByText={}) => {
        const { androidRectangles, iOSRectangles, reuseOcr } = options

        return ocrElementPositionByText({
          androidRectangles,
          iOSRectangles,
          isTesseractAvailable: tesseractAvailable,
          language: this._options.ocrLanguage || SUPPORTED_LANGUAGES.ENGLISH,
          reuseOcr: !!reuseOcr,
          ocrImagesPath: this._ocrImagesPath,
          screenSize,
          text: selector,
        })
      }
    )

    this._driver.addCommand(
      'ocrClickOnText',
      (selector: string, options: ClickOnTextOptions = {}) => {
        const { androidRectangles, iOSRectangles, reuseOcr } = options

        return ocrClickOnText({
          androidRectangles,
          iOSRectangles,
          isTesseractAvailable: tesseractAvailable,
          language: this._options.ocrLanguage || SUPPORTED_LANGUAGES.ENGLISH,
          reuseOcr: !!reuseOcr,
          ocrImagesPath: this._ocrImagesPath,
          screenSize,
          text: selector,
        })
      }
    )

    this._driver.addCommand('ocrGetText', (options: GetTextOptions = {}) => {
      const { androidRectangles, iOSRectangles, reuseOcr } = options

      return ocrGetText({
        androidRectangles,
        iOSRectangles,
        isTesseractAvailable: tesseractAvailable,
        language: this._options.ocrLanguage || SUPPORTED_LANGUAGES.ENGLISH,
        reuseOcr: !!reuseOcr,
        ocrImagesPath: this._ocrImagesPath,
        screenSize,
      })
    })

    this._driver.addCommand(
      'ocrWaitForTextDisplayed',
      (selector: string, options: WaitForTextDisplayedOptions = {}
      ) => {
        const { androidRectangles, iOSRectangles, timeout, timeoutMsg } = options

        return ocrWaitForTextDisplayed({
          androidRectangles,
          iOSRectangles,
          isTesseractAvailable: tesseractAvailable,
          language: this._options.ocrLanguage || SUPPORTED_LANGUAGES.ENGLISH,
          ocrImagesPath: this._ocrImagesPath,
          screenSize,
          text: selector,
          timeout,
          timeoutMsg,
        })
      }
    )

    this._driver.addCommand(
      'ocrSetValue',
      (selector: string, value: string, options: SetValueOptions = {}) => {
        const { androidRectangles, iOSRectangles, reuseOcr, clickDuration } = options

        return ocrSetValue({
          androidRectangles,
          iOSRectangles,
          isTesseractAvailable: tesseractAvailable,
          language: this._options.ocrLanguage || SUPPORTED_LANGUAGES.ENGLISH,
          ocrImagesPath: this._ocrImagesPath,
          reuseOcr: !!reuseOcr,
          screenSize,
          text: selector,
          value,
          clickDuration,
        })
      }
    )
  }
}