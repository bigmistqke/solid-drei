import { createMemo } from 'solid-js'
import { FontLoader } from 'three-stdlib'

export type Glyph = {
  /** Cached outline of the glyph */
  _cachedOutline: string[]
  /** Horizontal advance width of the glyph */
  ha: number
  /** Outline commands of the glyph */
  o: string
}

export type FontData = {
  /** Bounding box of the font */
  boundingBox: {
    /** Maximum y-coordinate of the bounding box */
    yMax: number
    /** Minimum y-coordinate of the bounding box */
    yMin: number
  }
  /** Family name of the font */
  familyName: string
  /** Map of glyphs in the font */
  glyphs: {
    [k: string]: Glyph
  }
  /** Resolution of the font */
  resolution: number
  /** Thickness of the underline */
  underlineThickness: number
}

let fontLoader: FontLoader | null = null

async function loader(font: string | FontData) {
  if (!fontLoader) fontLoader = new FontLoader()
  let data = typeof font === 'string' ? await (await fetch(font as string)).json() : font
  return fontLoader.parse(data as FontData)
}

/**
 * Loads a font using `FontLoader`.
 *
 * @param font - The font can be a URL string pointing to a font file or a `FontData` object.
 * @returns The loaded font.
 *
 * @example
 * // Using a URL string
 * export default () => {
 *   const fontUrl = () => 'path/to/your/font.json';
 *   const font = useFont(fontUrl);
 *   return (
 *     <Suspense>
 *       <T.Text font={font()} fontSize={2} color="blue">
 *         Hello, World!
 *       </T.Text>
 *     </Suspense>
 *   );
 * }
 *
 * @example
 * // Using a FontData object
 * export default () => {
 *   const fontData = () => ({
 *     boundingBox: { yMax: 1000, yMin: -200 },
 *     familyName: 'CustomFont',
 *     glyphs: { 'a': { _cachedOutline: [], ha: 500, o: '...' } },
 *     resolution: 1000,
 *     underlineThickness: 50,
 *   });
 *   const font = useFont(fontData);
 *   return (
 *     <Suspense>
 *       <T.Text font={font()} fontSize={2} color="blue">
 *         Custom Font Example
 *       </T.Text>
 *     </Suspense>
 *   );
 * }
 *
 * @note This hook uses `createMemo` under the hood, so you could use `<Suspense>` to handle loading states.
 *
 * @link https://threejs.org/docs/#examples/en/loaders/FontLoader
 */
export function useFont(font: () => string | FontData) {
  return createMemo(async () => loader(font()))
}
