export interface ScreenSize {
    width: number;
    height: number;
  }
  
  export interface Rectangles {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }
  
  export interface ClickPoint {
    x: number;
    y: number;
  }
  
  export interface DetermineClickPointOptions {
    rectangles: Rectangles;
  }
  
  export interface OcrServiceConfig {
    ocrImagesPath?: string;
    ocrLanguage?: string;
  }
  
  export interface WaitForTextDisplayedOptions {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    timeout?: number;
    timeoutMsg?: string;
  }
  
  export interface SetValueOptions {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    reuseOcr?: boolean;
    clickDuration?: Number;
  }
  
  export interface ClickOnTextOptions {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    reuseOcr?: boolean;
    clickDuration?: Number;
  }
  
  export interface GetTextOptions {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    reuseOcr?: boolean;
  }
  
  export interface ElementPositionByText {
    androidRectangles?: Rectangles;
    iOSRectangles?: Rectangles;
    reuseOcr?: boolean;
  }
  
  export interface Line {
    text: string;
    bbox: Rectangles;
  }
  
  export interface Words {
    text: string;
    bbox: Rectangles;
    wc: number;
  }
  
  export interface GetOcrData {
    text: string;
    lines: Line[];
    words: Words[];
  }
  