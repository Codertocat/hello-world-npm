import { execSync } from 'child_process'
import { createWorker, OEM, PSM } from 'tesseract.js'
// @ts-ignore
import { recognize } from 'node-tesseract-ocr'
import { parseString } from 'xml2js'
import { GetOcrData, Line, Words } from '../typings/types'
import { parseAttributeString } from './main'

export function isTesseractAvailable(tesseractName: string = ''): boolean {
  const binary = tesseractName || 'tesseract'
  const command = [binary, '--version'].join(' ')

  try {
    execSync(command)
  } catch (ign) {
    return false
  }

  return true
}

interface GetOcrDataOptions {
  filePath: string;
  language: string;
}

export async function getNodeOcrData(options: GetOcrDataOptions): Promise<GetOcrData|Error> {
  try {
    const { filePath, language } = options
    const jsonSingleWords: Words[] = []
    const jsonWordStrings: Line[] = []
    let composedBlocks: any = []

    const worker = await createWorker()
    await worker.load()
    await worker.loadLanguage(language)
    await worker.initialize(language)
    await worker.setParameters({
      tessedit_ocr_engine_mode: OEM.TESSERACT_LSTM_COMBINED,
      tessedit_pageseg_mode: PSM.AUTO,
      tessjs_create_tsv: '0',
      tessjs_create_box: '0',
      tessjs_create_unlv: '0',
      tessjs_create_osd: '0',
    })
    const { data: { text, hocr } } = await worker.recognize(filePath)

    // @ts-ignore
    parseString(hocr, (error: Error, data: any) => {
      if (error) {
        throw Error(`An error happened when parsing the getNodeOcrData, see: ${error}`)
      }

      composedBlocks = data.div.div
    })

    if (!composedBlocks || composedBlocks.length === 0){
      throw Error('No text was found for the OCR, please verify the stored image.')
    }

    // This is for single words
    // @ts-ignore
    composedBlocks.forEach(({ p: TextBlock }) => {
      // @ts-ignore
      TextBlock.forEach(({ span: TextLine }) => {
        // @ts-ignore
        TextLine.forEach(({ span: String }) => {
          // @ts-ignore
          String.forEach(({ _: text, $: { title } }) => {
            if (!text) {
              return
            }

            const attributes = `; ${title}`.split('; ')
            const { bbox, wc } = parseAttributeString(attributes)

            jsonSingleWords.push({
              text,
              bbox,
              wc,
            })
          })
        })
      })
    })

    // This is for single lines
    // @ts-ignore
    composedBlocks.forEach(({ p: TextBlock }) => {
      // @ts-ignore
      TextBlock.forEach(({ span: TextLine }) => {
        // @ts-ignore
        TextLine.forEach(({ $: { title }, span: String }) => {
          const attributes = `; ${title}`.split('; ')
          const { bbox } = parseAttributeString(attributes)
          const line = {
            text: '',
            bbox,
          }

          // @ts-ignore
          String.map(({ _: text }) => {
            line.text = `${line.text} ${text || ''}`.trim()
          })

          if (line.text === '') {
            return
          }

          jsonWordStrings.push(line)
        })
      })
    })

    await worker.terminate()

    return {
      lines: jsonWordStrings,
      words: jsonSingleWords,
      text,
    }
  } catch (error) {
    throw Error(`An error happened when parsing the getNodeOcrData, see: ${error}`)
  }
}

export async function getSystemOcrData(options: GetOcrDataOptions): Promise<GetOcrData|Error> {
  try {
    const { filePath, language } = options
    const jsonSingleWords: Words[] = []
    const jsonWordStrings: Line[] = []
    let composedBlocks: any = []
    let text: string = ''
    const result = await recognize(filePath, {
      lang: language,
      oem: 1,
      // https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
      psm: 3,
      presets: ['txt', 'alto'],
    })

    parseString(result, (error, data) => {
      if (error) {
        throw Error(`An error happened when parsing the getSystemOcrData, see: ${error}`)
      }

      text = data.alto.Layout[0]._ || text
      composedBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].ComposedBlock
    })

    if (!composedBlocks || composedBlocks.length === 0){
      throw Error('No text was found for the OCR, please verify the stored image.')
    }

    // This is for single words
    // @ts-ignore
    composedBlocks.forEach(({ TextBlock }) => {
      // @ts-ignore
      TextBlock.forEach(({ TextLine }) => {
        // @ts-ignore
        TextLine.forEach(({ String }) => {
          // @ts-ignore
          String.forEach(({ $: { CONTENT, HPOS, VPOS, WIDTH, HEIGHT, WC } }) => {
            jsonSingleWords.push({
              text: CONTENT || '',
              bbox: {
                left: Number(HPOS),
                top: Number(VPOS),
                right: Number(HPOS) + Number(WIDTH),
                bottom: Number(VPOS) + Number(HEIGHT),
              },
              wc: Number(WC),
            })
          }
          )
        })
      })
    })

    // This is for single lines
    // @ts-ignore
    composedBlocks.forEach(({ TextBlock }) => {
      // @ts-ignore
      TextBlock.forEach(({ TextLine }) => {
        // @ts-ignore
        TextLine.forEach(({ $: { HPOS, VPOS, WIDTH, HEIGHT }, String }) => {
          const line = {
            text: '',
            bbox: {
              left: Number(HPOS),
              top: Number(VPOS),
              right: Number(HPOS) + Number(WIDTH),
              bottom: Number(VPOS) + Number(HEIGHT),
            },
          }
          // @ts-ignore
          String.forEach(({ $: { CONTENT } }) => {
            line.text = `${line.text} ${CONTENT || ''}`.trim()
          })

          if (line.text === '') {
            return
          }

          jsonWordStrings.push(line)
        })
      })
    })

    return {
      lines: jsonWordStrings,
      words: jsonSingleWords,
      text: text,
    }
  } catch (error) {
    throw Error(`An error happened when parsing the getSystemOcrData, see: ${error}`)
  }
}