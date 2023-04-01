import Fuse from 'fuse.js'
import { Rectangles } from '../typings/types'

interface FuzzyFindOptions {
  textArray: {
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
  }[];
  pattern: string;
  searchOptions?: {
    isCaseSensitive?: boolean;
    /**
     * Only the matches whose length exceeds this value will be returned.
     * (For instance, if you want to ignore single character matches in the result, set it to 2)
     */
    minMatchCharLength?: number;
    /**
     * When true, the matching function will continue to the end of a search pattern even if a perfect match has
     * already been located in the string.
     */
    findAllMatches?: boolean;
    /**
     * Determines approximately where in the text is the pattern expected to be found
     */
    location?: number;
    /**
     * At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters
     * and location), a threshold of 1.0 would match anything.
     */
    threshold?: number;
    /**
     * Determines how close the match must be to the fuzzy location (specified by location). An exact letter match
     * which is distance characters away from the fuzzy location would score as a complete mismatch. A distance of
     * 0 requires the match be at the exact location specified. A distance of 1000 would require a perfect match to
     * be within 800 characters of the location to be found using a threshold of 0.8.
     */
    distance?: number;
  };
}

export function fuzzyFind(options: FuzzyFindOptions) {
  const { textArray, pattern, searchOptions } = options

  const fuzzyOptions = {
    ...searchOptions,
    // Defaults that should not be overwritten
    // See https://fusejs.io/api/options.html for more options
    ...{
      includeScore: true,
      isCaseSensitive: false,
      shouldSort: true,
      includeMatches: false,
      useExtendedSearch: false,
      ignoreLocation: false,
      ignoreFieldNorm: false,
      keys: ['text'],
    },
  }
  const fuse = new Fuse(textArray, fuzzyOptions)

  return fuse.search(pattern).map((item) => {
    /* istanbul ignore next */
    if (item.score) {
      item.score = item.score < 1e-10 ? 0 : item.score
      return item
    }
  })
}
