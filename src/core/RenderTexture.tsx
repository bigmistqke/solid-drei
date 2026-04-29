import { useRef } from '@/utils'
import type { JSX, Ref } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, Portal, useFrame, useThree } from 'solid-three'
import { Group, Object3D, Scene, Texture, WebGLRenderTarget } from 'three'
import { useFBO } from './useFBO'

type Props = S3.Props<Texture> & {
  ref?: Ref<Texture>
  /** Optional width of the texture, defaults to viewport bounds */
  width?: number
  /** Optional height of the texture, defaults to viewport bounds */
  height?: number
  /** Optional fbo samples */
  samples?: number
  /** Optional stencil buffer, defaults to false */
  stencilBuffer?: boolean
  /** Optional depth buffer, defaults to true */
  depthBuffer?: boolean
  /** Optional generate mipmaps, defaults to false */
  generateMipmaps?: boolean
  /** Optional render priority, defaults to 0 */
  renderPriority?: number
  /** Optional event priority, defaults to 0 */
  eventPriority?: number
  /** Optional frame count, defaults to Infinity. If you set it to 1, it would only render a single frame, etc */
  frames?: number
  /** Optional event compute, defaults to undefined */
  compute?: (event: any, state: any, previous: any) => false | undefined
  /** Children will be rendered into a portal */
  children: JSX.Element
}

export const RenderTexture = (props: Props) => {
  const [config, rest] = splitProps(
    mergeProps(
      {
        samples: 8,
        renderPriority: 0,
        eventPriority: 0,
        frames: Infinity,
        stencilBuffer: false,
        depthBuffer: false,
        generateMipmaps: false,
      },
      props,
    ),
    [
      'ref',
      'children',
      'compute',
      'width',
      'height',
      'samples',
      'renderPriority',
      'eventPriority',
      'frames',
      'stencilBuffer',
      'depthBuffer',
      'generateMipmaps',
    ],
  )

  const context = useThree()
  const fbo = useFBO(
    (config.width || context.bounds.width) * context.dpr,
    (config.height || context.bounds.height) * context.dpr,
    {
      samples: config.samples,
      stencilBuffer: config.stencilBuffer,
      depthBuffer: config.depthBuffer,
      generateMipmaps: config.generateMipmaps,
    },
  )
  const vScene = new Scene()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uvCompute = (_event: unknown, _state: unknown, _previous: unknown): false | undefined => {
    // UV raycasting compute (requires r3f-compatible event system)
    return undefined
  }

  useRef(config, fbo.texture)

  return (
    <>
      <Portal element={vScene}>
        {/* { events: { compute: props.compute || uvCompute, priority: props.eventPriority } } */}
        <Container renderPriority={config.renderPriority} frames={config.frames} fbo={fbo}>
          <Entity from={Group} onPointerEnter={() => null} />
          {config.children}
          {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
        </Container>
      </Portal>
      <Entity from={fbo.texture} {...rest} />
    </>
  )
}

// The container component has to be separate, it can not be inlined because useFrame when run inside createPortal will return
// the portals own state which includes user-land overrides (custom cameras etc), but if it is executed in <RenderTexture>'s render function
// it would return the default state.
function Container(props: {
  frames: number
  renderPriority: number
  children: JSX.Element
  fbo: WebGLRenderTarget
}) {
  let count = 0
  let oldAutoClear: boolean
  const store = useThree()
  useFrame(
    () => {
      if (props.frames === Infinity || count < props.frames) {
        oldAutoClear = store.gl.autoClear
        store.gl.autoClear = true
        store.gl.setRenderTarget(props.fbo)
        store.gl.render(store.scene, store.camera)
        store.gl.setRenderTarget(null)
        store.gl.autoClear = oldAutoClear
        count++
      }
    },
    { priority: props.renderPriority },
  )
  return <>{props.children}</>
}
