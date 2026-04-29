import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js'
import { useFrame } from 'solid-three'
import { RepeatWrapping, Sprite, SpriteMaterial, TextureLoader } from 'three'
import { useLoader } from './useLoader'

/**********************************************************************************/
/*                                                                                */
/*                                     Types                                      */
/*                                                                                */
/**********************************************************************************/

/** A single frame entry inside atlas JSON `frames` array format */
interface AtlasFrameEntry {
  frame: { x: number; y: number; w: number; h: number }
  rotated?: boolean
  trimmed?: boolean
  spriteSourceSize?: { x: number; y: number; w: number; h: number }
  sourceSize: { w: number; h: number }
}

/** The atlas JSON meta section */
interface AtlasMeta {
  size: { w: number; h: number }
  scale?: string | number
  version?: string
}

/** Parsed atlas JSON (TexturePacker array format) */
export interface AtlasData {
  frames: AtlasFrameEntry[] | Record<string, AtlasFrameEntry>
  meta: AtlasMeta
}

/** Sprite sheet config when no JSON atlas is provided */
export interface SpriteConfig {
  frameWidth: number
  frameHeight: number
}

/** Object returned by `useSpriteLoader` */
export interface SpriteLoaderResult {
  /** The THREE.Sprite with the texture already applied */
  spriteObj: Sprite
  /** Reactive accessor for the current frame index */
  currentFrame: Accessor<number>
  /** Total number of frames in the active animation (or sheet) */
  totalFrames: number
  /** Start / resume playback of a named animation, or the whole sheet when omitted */
  play: (animName?: string) => void
  /** Pause playback */
  pause: () => void
}

/**********************************************************************************/
/*                                                                                */
/*                                     Utils                                      */
/*                                                                                */
/**********************************************************************************/

/** Build a flat frame list from an atlas JSON filtered by optional animation name delimiters */
function buildFrameList(
  atlas: AtlasData,
  animationNames?: string[],
): AtlasFrameEntry[] {
  const { frames } = atlas

  if (Array.isArray(frames)) {
    if (!animationNames || animationNames.length === 0) return frames
    // filter by name index — array atlases don't have names, return all
    return frames
  }

  // Hash-map atlas
  const keys = Object.keys(frames)

  if (!animationNames || animationNames.length === 0) {
    return keys.map(k => frames[k]!)
  }

  return keys
    .filter(k => animationNames.some(name => k.toLowerCase().includes(name.toLowerCase())))
    .map(k => frames[k]!)
}

/** Build a per-animation frame list map from a hash atlas */
function buildAnimationMap(
  atlas: AtlasData,
  animationNames: string[],
): Record<string, AtlasFrameEntry[]> {
  const { frames } = atlas
  if (Array.isArray(frames)) return {}

  const map: Record<string, AtlasFrameEntry[]> = {}
  for (const name of animationNames) {
    map[name] = Object.keys(frames)
      .filter(k => k.toLowerCase().includes(name.toLowerCase()))
      .map(k => frames[k]!)
  }
  return map
}

/** Derive a synthetic AtlasData from sheet dimensions + frame size */
function atlasFromConfig(imageWidth: number, imageHeight: number, cfg: SpriteConfig): AtlasData {
  const { frameWidth, frameHeight } = cfg
  const cols = Math.floor(imageWidth / frameWidth)
  const rows = Math.floor(imageHeight / frameHeight)
  const frameList: AtlasFrameEntry[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      frameList.push({
        frame: { x: col * frameWidth, y: row * frameHeight, w: frameWidth, h: frameHeight },
        sourceSize: { w: frameWidth, h: frameHeight },
      })
    }
  }

  return {
    frames: frameList,
    meta: { size: { w: imageWidth, h: imageHeight } },
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                 useSpriteLoader                                */
/*                                                                                */
/**********************************************************************************/

/**
 * Hook for loading sprite sheets (texture atlases) and animating sprites.
 *
 * @param input - URL to a sprite image or a TexturePacker JSON atlas file
 * @param config - `{ frameWidth, frameHeight }` when no JSON atlas is used, or a pre-parsed `AtlasData`
 * @param animationNames - Animation name filters for hash-map atlases
 * @param fps - Playback frame rate (default: 30)
 * @param onLoad - Optional callback fired after the texture is loaded
 * @returns `SpriteLoaderResult` with `spriteObj`, `currentFrame`, `totalFrames`, `play`, `pause`
 *
 * @example
 * ```tsx
 * const { spriteObj, play, pause } = useSpriteLoader('/sprite.png', { frameWidth: 64, frameHeight: 64 }, [], 24)
 * play()
 * return <Entity from={spriteObj} />
 * ```
 */
export function useSpriteLoader(
  input: string,
  config: SpriteConfig | AtlasData | null,
  animationNames?: string[],
  fps: number = 30,
  onLoad?: (result: SpriteLoaderResult) => void,
): SpriteLoaderResult {
  const [currentFrame, setCurrentFrame] = createSignal(0)
  const [isPlaying, setIsPlaying] = createSignal(false)
  const [activeAnim, setActiveAnim] = createSignal<string | undefined>(undefined)

  // --- Load texture -------------------------------------------------------
  const texture = useLoader(TextureLoader, () => input)

  // --- Build sprite object ------------------------------------------------
  const material = new SpriteMaterial({ transparent: true, toneMapped: false, alphaTest: 0 })
  const spriteObj = new Sprite(material)

  // --- Build atlas data ---------------------------------------------------
  // We'll resolve this once the texture is available (for image dimensions).
  // If `config` is already AtlasData we can use it immediately; if it's
  // SpriteConfig we need the image dimensions; if null we treat it as a .json URL.

  let resolvedAtlas: AtlasData | null = null
  let frameList: AtlasFrameEntry[] = []
  let animationMap: Record<string, AtlasFrameEntry[]> = {}

  // When `input` points to a JSON atlas (no SpriteConfig supplied and config is null/AtlasData-like)
  // we fetch it; otherwise we derive from config + image dimensions.
  let jsonFetchPromise: Promise<AtlasData> | null = null

  if (config === null || (config && 'frames' in config && 'meta' in config)) {
    if (config !== null) {
      // Pre-parsed AtlasData passed directly
      resolvedAtlas = config as AtlasData
    } else {
      // `input` is a JSON atlas URL — fetch it
      jsonFetchPromise = fetch(input)
        .then(r => r.json() as Promise<AtlasData>)
        .catch(() => null as unknown as AtlasData)
    }
  }
  // else: config is SpriteConfig — derive after texture loads

  // Recompute frame list once we have both texture and atlas
  createEffect(
    () => texture(),
    () => {
      const tex = texture()
      if (!tex) return

      // Apply texture to material
      tex.wrapS = tex.wrapT = RepeatWrapping
      material.map = tex
      material.needsUpdate = true

      const finalize = (atlas: AtlasData) => {
        resolvedAtlas = atlas
        frameList = buildFrameList(atlas, animationNames)
        if (animationNames && animationNames.length > 0) {
          animationMap = buildAnimationMap(atlas, animationNames)
        }

      const totalF = frameList.length

      // Set initial UV repeat based on first frame sourceSize
      const firstFrame = frameList[0]
      if (firstFrame) {
        const { w: fw, h: fh } = firstFrame.sourceSize
        const { w: mw, h: mh } = atlas.meta.size
        tex.repeat.set(fw / mw, fh / mh)
        tex.offset.set(0, 1 - fh / mh)
        spriteObj.scale.set(1, fh / fw, 1)
      }

      tex.needsUpdate = true

      if (onLoad) {
        onLoad({
          spriteObj,
          currentFrame,
          totalFrames: totalF,
          play,
          pause,
        })
      }
    }

    if (resolvedAtlas) {
      finalize(resolvedAtlas)
    } else if (jsonFetchPromise) {
      jsonFetchPromise.then(atlas => {
        if (atlas) finalize(atlas)
      })
    } else if (config && 'frameWidth' in config) {
      const w = tex.image?.width as number
      const h = tex.image?.height as number
      if (w && h) {
        finalize(atlasFromConfig(w, h, config as SpriteConfig))
      }
    }
  })

  // --- Animation tick -----------------------------------------------------
  let timerOffset = performance.now()
  const fpsInterval = () => 1000 / fps

  useFrame(() => {
    if (!isPlaying()) return
    const tex = texture()
    if (!tex || !resolvedAtlas) return

    const now = performance.now()
    const diff = now - timerOffset
    if (diff < fpsInterval()) return
    timerOffset = now - (diff % fpsInterval())

    const frames = activeAnim()
      ? (animationMap[activeAnim()!] ?? frameList)
      : frameList

    if (frames.length === 0) return

    const nextFrame = (currentFrame() + 1) % frames.length
    setCurrentFrame(nextFrame)

    const entry = frames[nextFrame]!
    const { w: mw, h: mh } = resolvedAtlas.meta.size
    const { frame: { x: fx, y: fy, w: fw, h: fh }, sourceSize: { w: sw, h: sh } } = entry

    tex.repeat.set(fw / mw, fh / mh)
    // UV Y is flipped — texture origin is bottom-left in WebGL
    tex.offset.set(fx / mw, 1 - (fy + fh) / mh)
    tex.needsUpdate = true

    spriteObj.scale.set(1, sh / sw, 1)
  })

  // --- Public API ---------------------------------------------------------
  function play(animName?: string): void {
    setActiveAnim(animName)
    setCurrentFrame(0)
    timerOffset = performance.now()
    setIsPlaying(true)
  }

  function pause(): void {
    setIsPlaying(false)
  }

  const totalFrames = frameList.length

  const result: SpriteLoaderResult = {
    spriteObj,
    currentFrame,
    totalFrames,
    play,
    pause,
  }

  onCleanup(() => {
    material.dispose()
  })

  return result
}

/** Alias export matching the drei naming convention */
export const SpriteLoader = useSpriteLoader
