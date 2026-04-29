import { check, every, when } from '@/utils/conditionals'
import {
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createResource,
  createSignal,
  splitProps,
  untrack,
} from 'solid-js'
import { createT, useFrame, type S3 } from 'solid-three'
import { Group, RepeatWrapping, Sprite, SpriteMaterial, TextureLoader } from 'three'

const T = createT({ Group, Sprite, SpriteMaterial })

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function getFirstItem(param: any) {
  if (Array.isArray(param)) {
    return param[0]
  } else if (typeof param === 'object' && param !== null) {
    const keys = Object.keys(param)
    return param[keys[0]!][0]
  } else {
    return { w: 0, h: 0 }
  }
}

function calculateAspectRatio(width: number, height: number): [number, number, number] {
  const aspectRatio = height / width
  return [1, aspectRatio, 1]
}

type Sprites = Record<
  string,
  Array<{
    x: number
    y: number
    w: number
    h: number
    frame: { x: number; y: number; w: number; h: number }
    sourceSize: { w: number; h: number }
  }>
>
// for frame based JSON Hash sprite data
function spriteDataToSprites(data: any, delimiters?: string[]) {
  const sprites: Sprites = {}

  if (delimiters) {
    for (let i = 0; i < delimiters.length; i++) {
      sprites[delimiters[i]!] = []
      for (let innerKey in data['frames']) {
        if (
          typeof innerKey === 'string' &&
          innerKey.toLowerCase().indexOf(delimiters[i]!.toLowerCase()) !== -1
        ) {
          const value = data.frames[innerKey]
          const frame = value.frame
          sprites[delimiters[i]!]!.push({
            frame,
            sourceSize: value.sourceSize,
            x: frame.x,
            y: frame.y,
            w: frame.width,
            h: frame.height,
          })
        }
      }
    }
  }

  return sprites
}

/**********************************************************************************/
/*                                                                                */
/*                                 Sprite Animator                                */
/*                                                                                */
/**********************************************************************************/

interface SpriteData {
  frames: Array<{
    frame: { x: number; y: number; w: number; h: number }
    rotated: boolean
    trimmed: boolean
    spriteSourceSize: { x: number; y: number; w: number; h: number }
    sourceSize: { w: number; h: number }
  }>
  meta: {
    version: '1.0'
    size: { w: number; h: number }
    scale: '1'
  }
}

export interface SpriteAnimatorProps extends S3.Props<Group> {
  startFrame?: number
  endFrame?: number
  fps?: number
  frameName?: string
  textureDataURL?: string
  textureImageURL: string
  loop?: boolean
  numberOfFrames?: number
  autoPlay?: boolean
  animationNames?: Array<string>
  onStart?: Function
  onEnd?: Function
  onLoopEnd?: Function
  onFrame?: Function
  play?: boolean
  pause?: boolean
  flipX?: boolean
  alphaTest?: number
}

export function SpriteAnimator(props: SpriteAnimatorProps) {
  const [config, rest] = splitProps(props, [
    'startFrame',
    'endFrame',
    'fps',
    'frameName',
    'textureDataURL',
    'textureImageURL',
    'loop',
    'numberOfFrames',
    'autoPlay',
    'animationNames',
    'onStart',
    'onEnd',
    'onLoopEnd',
    'onFrame',
    'play',
    'pause',
    'flipX',
    'alphaTest',
    'children',
  ])
  const [isJsonReady, setJsonReady] = createSignal(false)
  const [sprite, setSprite] = createSignal<Sprite>()
  const [spriteMaterial, setSpriteMaterial] = createSignal<SpriteMaterial>()

  let currentFrame: number = config.startFrame || 0
  let currentFrameName: string = config.frameName || ''
  let timerOffset = window.performance.now()

  const fpsInterval = () => 1000 / (config.fps || 30)
  const flipOffset = () => (config.flipX ? -1 : 1)

  const [spriteTexture] = createResource(async () => {
    const textureLoader = new TextureLoader()
    const texture = await textureLoader.loadAsync(untrack(() => config.textureImageURL))
    texture.premultiplyAlpha = false
    return texture
  })

  const [json] = createResource(async () => {
    let result: SpriteData | undefined
    if (config.textureDataURL) {
      try {
        result = await fetch(config.textureDataURL).then(
          response => response.json() as unknown as SpriteData | undefined,
        )
      } catch (err) {
        console.error(err)
        return 'NONE'
      }
    }
    return result || 'NONE'
  })

  const [spriteData] = createResource(every(spriteTexture, json), async ([texture, json]) => {
    if (json !== 'NONE') return json

    if (!config.numberOfFrames) return undefined

    //get size from texture
    const width = texture.image.width
    const height = texture.image.height
    const frameWidth = width / config.numberOfFrames
    const frameHeight = height

    const data: SpriteData = {
      frames: [],
      meta: {
        version: '1.0',
        size: { w: width, h: height },
        scale: '1',
      },
    }

    if (parseInt(frameWidth.toString(), 10) === frameWidth) {
      // if it fits
      for (let i = 0; i < config.numberOfFrames; i++) {
        data.frames.push({
          frame: { x: i * frameWidth, y: 0, w: frameWidth, h: frameHeight },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
          sourceSize: { w: frameWidth, h: height },
        })
      }
    }

    return data
  })

  const sprites = createMemo(
    when(spriteData, spriteData => {
      if (Array.isArray(spriteData.frames)) return spriteData.frames
      return spriteDataToSprites(spriteData, config.animationNames)
    }),
  )

  const aspect = when(
    sprites,
    sprites => {
      const { w, h } = getFirstItem(sprites).sourceSize
      return calculateAspectRatio(w, h)
    },
    () => [1, 1, 1] as [number, number, number],
  )

  createEffect(
    when(every(aspect, sprite), ([aspect, spriteRef]) => spriteRef.scale.set(1, aspect[1], 1)),
  )

  createEffect(
    when(
      every(spriteMaterial, spriteTexture),
      ([spriteMaterial, spriteTexture]) => (spriteMaterial.map = spriteTexture),
    ),
  )

  createRenderEffect(
    when(
      every(spriteMaterial, spriteData),
      ([
        spriteMaterial,
        {
          meta: { size: metaInfo },
          frames,
        },
      ]) => {
        const { w: frameWidth, h: frameHeight } = Array.isArray(frames)
          ? frames[0]!.sourceSize
          : config.frameName
          ? frames[config.frameName]
            ? /* @ts-ignore-error TODO: fix types */
              frames[config.frameName][0].sourceSize
            : { w: 0, h: 0 }
          : { w: 0, h: 0 }

        createRenderEffect(
          () => [spriteTexture(), config.flipX] as const,
          ([texture, flipX]) => {
            spriteMaterial.map!.wrapS = spriteMaterial.map!.wrapT = RepeatWrapping
            spriteMaterial.map!.center.set(0, 0)
            spriteMaterial.map!.repeat.set(
              (1 * flipOffset()) / (metaInfo.w / frameWidth),
              1 / (metaInfo.h / frameHeight),
            )
            //const framesH = (metaInfo.w - 1) / frameW
            const framesV = (metaInfo.h - 1) / frameHeight
            const frameOffsetY = 1 / framesV
            spriteMaterial.map!.offset.x = 0.0 //-matRef.map.repeat.x
            spriteMaterial.map!.offset.y = 1 - frameOffsetY
            setJsonReady(true)
            if (config.onStart) {
              config.onStart({ currentFrameName: config.frameName, currentFrame: currentFrame })
            }
          },
        )
      },
    ),
  )

  createEffect(() => {
    if (config.frameName && currentFrameName !== config.frameName) {
      currentFrame = 0
      currentFrameName = config.frameName
    }
  })

  // *** Warning! It runs on every frame! ***
  const tick = when(
    every(spriteData, spriteMaterial),
    ([
      {
        meta: { size: metaInfo },
        frames,
      },
      spriteMaterial,
    ]) => {
      if (!frames || !spriteMaterial.map || config.autoPlay || config.play) return

      if (config.autoPlay || config.play) {
        // run the animation on each frame

        const now = window.performance.now()
        const diff = now - timerOffset

        const { w: frameW, h: frameH } = getFirstItem(frames).sourceSize
        const spriteFrames = Array.isArray(frames)
          ? frames
          : config.frameName
          ? frames[config.frameName]
          : []

        let finalValX = 0
        let finalValY = 0
        const _endFrame = config.endFrame || spriteFrames.length - 1

        if (currentFrame > _endFrame) {
          currentFrame = config.loop ? config.startFrame ?? 0 : 0
          if (config.loop) {
            config.onLoopEnd?.({
              currentFrameName: config.frameName,
              currentFrame: currentFrame,
            })
          } else {
            config.onEnd?.({
              currentFrameName: config.frameName,
              currentFrame: currentFrame,
            })
          }
          if (!config.loop) return
        }

        if (diff <= fpsInterval()) return
        timerOffset = now - (diff % fpsInterval())

        check(sprite, sprite => {
          const aspect = calculateAspectRatio(frameW, frameH)
          sprite.scale.set(1, aspect[1], 1)
        })

        const framesH = (metaInfo.w - 1) / frameW
        const framesV = (metaInfo.h - 1) / frameH
        const {
          frame: { x: frameX, y: frameY },
          sourceSize: { w: originalSizeX, h: originalSizeY },
        } = spriteFrames[currentFrame]!
        const frameOffsetX = 1 / framesH
        const frameOffsetY = 1 / framesV
        finalValX =
          flipOffset() > 0
            ? frameOffsetX * (frameX / originalSizeX)
            : frameOffsetX * (frameX / originalSizeX) - spriteMaterial.map!.repeat.x
        finalValY = Math.abs(1 - frameOffsetY) - frameOffsetY * (frameY / originalSizeY)

        spriteMaterial.map!.offset.x = finalValX
        spriteMaterial.map!.offset.y = finalValY

        currentFrame += 1

        config.onFrame?.({ currentFrameName, currentFrame })
      }
    },
  )

  useFrame(() => {
    if (config.pause) return
    tick()
  })

  return (
    <T.Group {...rest}>
      <Show when={spriteTexture()}>
        {spriteTexture => (
          <T.Sprite ref={setSprite} scale={aspect()}>
            <T.SpriteMaterial
              ref={setSpriteMaterial}
              alphaTest={config.alphaTest ?? 0.0}
              map={spriteTexture()}
              toneMapped={false}
              transparent={true}
            />
          </T.Sprite>
        )}
      </Show>
      {config.children}
    </T.Group>
  )
}
