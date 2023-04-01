import ocrGetData from './ocrGetData'
import { getDprPositions } from './index'
import { Line, Rectangles } from '../typings/types'

interface OcrGetTextPositionsOptions {
  androidRectangles?:Rectangles;
  iOSRectangles?:Rectangles;
  isTesseractAvailable: boolean;
  language: string;
  ocrImagesPath: string;
  reuseOcr: boolean;
  screenSize: {
    width: number;
    height: number;
  };
}

interface OcrGetTextPositions {
  dprPosition: Rectangles;
  originalPosition: Rectangles;
  text: string;
}

export default async function ocrGetTextPositions(options: OcrGetTextPositionsOptions): Promise<OcrGetTextPositions[]> {
  const { dpr, lines } = await ocrGetData(options)

  return (
    lines
      .map(({ text, bbox }:Line) => ({
        text: text.replace(/(^\s+|\s+$)/g, ''),
        originalPosition: bbox,
        dprPosition: getDprPositions(JSON.parse(JSON.stringify(bbox)), dpr),
      }))
      .filter((element) => element.text)
  )
}