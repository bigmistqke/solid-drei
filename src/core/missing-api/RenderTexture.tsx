import { JSX, Ref, createEffect, mergeProps, on, splitProps } from 'solid-js'
import { S3, T, useFrame, useThree } from 'solid-three'
import { Object3D, Scene, Texture, WebGLRenderTarget } from 'three'
import { useFBO } from '../unported/useFBO'

type Props = S3.Props<'Texture'> & {
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
    (config.width || context.size.width) * context.dpr,
    (config.height || context.size.height) * context.dpr,
    {
      samples: config.samples,
      stencilBuffer: config.stencilBuffer,
      depthBuffer: config.depthBuffer,
      generateMipmaps: config.generateMipmaps,
    },
  )
  const vScene = new Scene()

  const uvCompute = (event, state, previous) => {
    // Since this is only a texture it does not have an easy way to obtain the parent, which we
    // need to transform event coordinates to local coordinates. We use r3f internals to find the
    // next Object3D.
    let parent = (fbo.texture as any)?.__r3f.parent
    while (parent && !(parent instanceof Object3D)) {
      parent = parent.__r3f.parent
    }
    if (!parent) return false
    // First we call the previous state-onion-layers compute, this is what makes it possible to nest portals
    if (!previous.raycaster.camera)
      previous.events.compute(event, previous, previous.previousRoot?.getState())
    // We run a quick check against the parent, if it isn't hit there's no need to raycast at all
    const [intersection] = previous.raycaster.intersectObject(parent)
    if (!intersection) return false
    // We take that hits uv coords, set up this layers raycaster, et voilà, we have raycasting on arbitrary surfaces
    const uv = intersection.uv
    if (!uv) return false
    state.raycaster.setFromCamera(state.pointer.set(uv.x * 2 - 1, uv.y * 2 - 1), state.camera)
  }

  createEffect(
    on(
      () => [config.ref, fbo],
      () => {
        config.ref = fbo.texture
      },
    ),
  )
  return (
    <>
      <T.Portal element={vScene}>
        {/* { events: { compute: props.compute || uvCompute, priority: props.eventPriority } } */}
        <Container renderPriority={config.renderPriority} frames={config.frames} fbo={fbo}>
          <T.Group onPointerEnter={() => null} />
          {config.children}
          {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
        </Container>
      </T.Portal>
      <T.Primitive object={fbo.texture} {...rest} />
    </>
  )
}

// The container component has to be separate, it can not be inlined because "useFrame(state" when run inside createPortal will return
// the portals own state which includes user-land overrides (custom cameras etc), but if it is executed in <RenderTexture>'s render function
// it would return the default state.
function Container(props: {
  frames: number
  renderPriority: number
  children: JSX.Element
  fbo: WebGLRenderTarget
}) {
  let count = 0
  let oldAutoClear
  useFrame(
    state => {
      if (props.frames === Infinity || count < props.frames) {
        oldAutoClear = state.gl.autoClear
        state.gl.autoClear = true
        state.gl.setRenderTarget(props.fbo)
        state.gl.render(state.scene, state.camera)
        state.gl.setRenderTarget(null)
        state.gl.autoClear = oldAutoClear
        count++
      }
    },
    () => props.renderPriority,
  )
  return <>{props.children}</>
}
