import { processProps, resolve } from '@/utils'
import type { JSX } from 'solid-js'
import { createMemo, createResource, onCleanup, onMount, Show } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import type { Mesh } from 'three'
import { Font } from 'three-stdlib'
// @ts-ignore - troika-three-text has no TypeScript declarations
import { preloadFont, Text as TroikaMesh } from 'troika-three-text'

interface Props extends S3.Props<typeof Mesh> {
  /** The text or elements to display */
  children: JSX.Element | JSX.Element[]
  /** Characters to preload */
  characters?: string
  /** Color of the text */
  color?: S3.Color
  /** Font size, default: 1 */
  fontSize?: number
  /** Maximum width of the text box */
  maxWidth?: number
  /** Line height */
  lineHeight?: number
  /** Letter spacing */
  letterSpacing?: number
  /** Text alignment, default: 'left' */
  textAlign?: 'left' | 'right' | 'center' | 'justify'
  /** Font URL or name */
  font?: string
  /** X-axis anchor, default: 'center' */
  anchorX?: number | 'left' | 'center' | 'right'
  /** Y-axis anchor, default: 'middle' */
  anchorY?: number | 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom'
  /** Clipping rectangle */
  clipRect?: [number, number, number, number]
  /** Depth offset */
  depthOffset?: number
  /** Text direction, default: 'auto' */
  direction?: 'auto' | 'ltr' | 'rtl'
  /** How to handle text overflow, default: 'normal' */
  overflowWrap?: 'normal' | 'break-word'
  /** White space handling, default: 'normal' */
  whiteSpace?: 'normal' | 'overflowWrap' | 'nowrap'
  /** Width of the text outline */
  outlineWidth?: number | string
  /** X offset of the text outline */
  outlineOffsetX?: number | string
  /** Y offset of the text outline */
  outlineOffsetY?: number | string
  /** Blur amount for the text outline */
  outlineBlur?: number | string
  /** Color of the text outline */
  outlineColor?: S3.Color
  /** Opacity of the text outline */
  outlineOpacity?: number
  /** Width of the text stroke */
  strokeWidth?: number | string
  /** Color of the text stroke */
  strokeColor?: S3.Color
  /** Opacity of the text stroke */
  strokeOpacity?: number
  /** Opacity of the text fill */
  fillOpacity?: number
  /** Glyph size for SDF rendering, default: 64 */
  sdfGlyphSize?: number
  /** Debug SDF rendering */
  debugSDF?: boolean
  /** Callback function when the text syncs */
  onSync?: (troika: any) => void
}

/**
 * Renders 3D text using `troika-three-text`.
 *
 * This component allows rendering of 3D text with various customization options including font, size, color, alignment, and more.
 *
 * @example
 * export default () => {
 *   return (
 *     <Text font="https://example.com/my-font.woff" fontSize={2} color="blue" anchorX="center" anchorY="middle">
 *       Hello, World!
 *     </Text>
 *   );
 * }
 *
 * @example
 * export default () => {
 *   return (
 *     <Text
 *       font="https://example.com/my-font.woff"
 *       fontSize={1.5}
 *       color="red"
 *       anchorX="left"
 *       anchorY="top"
 *       maxWidth={200}
 *       lineHeight={1.2}
 *       letterSpacing={0.1}
 *       textAlign="justify"
 *       strokeWidth={0.05}
 *       strokeColor="black"
 *     >
 *       This is a more advanced example with multiple properties set to customize the text appearance.
 *     </Text>
 *   );
 * }
 *
 * @note
 * Ensure the `font` prop is a valid URL to a font file or a font name.
 *
 * @link https://github.com/protectwise/troika/tree/master/packages/troika-three-text
 */
export function Text(props: Props) {
  const [config, rest] = processProps(
    props,
    {
      sdfGlyphSize: 64,
      anchorX: 'center',
      anchorY: 'middle',
    },
    ['sdfGlyphSize', 'anchorX', 'anchorY', 'font', 'fontSize', 'children', 'characters', 'onSync'],
  )

  const troikaMesh = new TroikaMesh()

  const [font] = createResource(
    () => [config.font, config.characters],
    ([font, characters]) => {
      return new Promise<Font>(res =>
        preloadFont({ font: font || null, characters: characters || '' }, res),
      )
    },
  )

  const memo = createMemo(() => {
    const nodes: JSX.Element[] = []
    let text = ''

    const children = Array.isArray(config.children) ? config.children : [config.children]

    children.forEach(childAccessor => {
      const child = resolve(childAccessor)
      if (typeof child === 'string' || typeof child === 'number') {
        text += child
      } else {
        nodes.push(child)
      }
    })

    return { nodes, text }
  })

  onMount(() => {
    troikaMesh.sync(() => config.onSync && config.onSync(troikaMesh))
    onCleanup(() => troikaMesh.dispose())
  })

  return (
    <Show when={font()}>
      <Entity
        from={troikaMesh}
        font={props.font}
        text={memo().text}
        anchorX={config.anchorX}
        anchorY={config.anchorY}
        fontSize={config.fontSize}
        sdfGlyphSize={config.sdfGlyphSize}
        {...rest}
      >
        {memo().nodes}
      </Entity>
    </Show>
  )
}
