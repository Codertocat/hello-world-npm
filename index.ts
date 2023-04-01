import { mkdirSync } from 'fs'
import {
  ClickOnTextOptions,
  ElementPositionByText,
  GetTextOptions,
  Rectangles,
  OcrServiceConfig,
  ScreenSize,
  WaitForTextDisplayedOptions,
} from './src/typings/types'
import { SUPPORTED_LANGUAGES } from './src/utils/constants'
import ocrGetData from './src/utils/ocrGetData'
import { fuzzyFind } from './src/utils/fuzzySearch'
import ocrGetTextPositions from './src/utils/ocrGetTextPositions'

function helloWorld() {
    console.log('Hello World!');
  }
  
  module.exports = {
    helloWorld: helloWorld
  }
  
  interface OcrGetElementPositionByTextOptions {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
    reuseOcr: boolean;
    screenSize: ScreenSize;
    text: string;
  }
  
  export interface FuzzyElement {
    /**
     * The found item
     */
    item: {
      /**
       * the matched string
       */
      text: string;
      /**
       * The original position
       */
      originalPosition: Rectangles;
      /**
       * The position after DPR check
       * screenshots for iOS are with DPR
       * position on the screen for iOS is smaller
       */
      dprPosition: Rectangles;
    };
    /**
     * Index of the fuzzy logic check
     */
    refIndex: number;
    /**
     * Matched score of the fuzzy logic check
     */
    score: number;
  }
  
  interface OcrGetElementPositionByText {
    /**
     * the original search value
     */
    searchValue: string;
    /**
     * the matched string
     */
    matchedString: string;
    /**
     * The original position
     */
    originalPosition: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    },
    /**
     * The position after DPR check
     * screenshots for iOS are with DPR
     * position on the screen for iOS is smaller
     */
    dprPosition: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    },
    /**
     * Matched score of the fuzzy logic check
     */
    score: number;
  }
  
  export async function ocrGetElementPositionByText(
    data: OcrGetElementPositionByTextOptions
  ): Promise<OcrGetElementPositionByText> {
    const {
      language,
      ocrImagesPath,
      text,
    } = data
    const textPositions = await ocrGetTextPositions({
      language,
      ocrImagesPath,
      isTesseractAvailable: true,
      reuseOcr: true,
      screenSize: {
        width: 0,
        height: 0
      }
    })
    const matches = fuzzyFind({
      textArray: textPositions,
      pattern: text,
    })
    let element
    let score
  
    if (matches.length === 0) {
      console.log(`No matches were found based on the word "${text}"`)
  
      throw new Error(
        `InvalidSelectorMatch. Strategy 'ocr' has failed to find word '${text}' in the image`
      )
    } else if (matches.length > 1) {
      // @ts-ignore
      matches.sort((a, b) => (a.score > b.score ? 1 : -1))
      element = matches[0] as FuzzyElement
      score = Number(((1-element.score)*100).toFixed(2))
      const messageOne = `Multiple matches were found based on the word "${text}".`
      // @ts-ignore
      const messageTwo = `The match "${element.item.text}" with score "${score}%" will be used.`
      console.log(`${messageOne} ${messageTwo}`)
    } else {
      element = matches[0] as FuzzyElement
      score = Number(((1-element.score)*100).toFixed(2))
      console.log(
        `We searched for the word "${text}" and found one match "${element.item.text}" with score "${score}%"`
      )
    }
  
    return {
      searchValue: text,
      matchedString: element.item.text,
      originalPosition: element.item.originalPosition,
      dprPosition: element.item.dprPosition,
      score,
    }
  }

  interface OcrGetTextOptions {
    androidRectangles?:Rectangles;
    iOSRectangles?:Rectangles;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
    reuseOcr: boolean;
    screenSize: ScreenSize;
  }

export async function ocrGetText(options: OcrGetTextOptions): Promise<string> {
  const { text } = await ocrGetData(options)

  return text.replace(/\n\s*\n/g, '\n')
}
