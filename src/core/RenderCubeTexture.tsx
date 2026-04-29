import { useRef } from '@/utils'
import type { JSX, Ref } from 'solid-js'
import { merge, omit } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, Portal, useFrame, useThree } from 'solid-three'
import { CubeCamera, CubeTexture, HalfFloatType, Scene, WebGLCubeRenderTarget } from 'three'

type Props = S3.Props<CubeTexture> & {
  ref?: Ref<CubeTexture>
  /** Resolution of the cube map, defaults to 256 */
  resolution?: number
  /** Camera near plane, defaults to 0.1 */
  near?: number
  /** Camera far plane, defaults to 1000 */
  far?: number
  /** Optional render priority, defaults to 0 */
  renderPriority?: number
  /** Optional frame count, defaults to Infinity */
  frames?: number
  /** Children will be rendered into the cube map portal */
  children: JSX.Element
}

export const RenderCubeTexture = (props: Props) => {
  const merged = merge(
    {
      resolution: 256,
      near: 0.1,
      far: 1000,
      renderPriority: 0,
      frames: Infinity,
    },
    props,
  )
  const rest = omit(merged, 'ref', 'children', 'resolution', 'near', 'far', 'renderPriority', 'frames')
  const config = merged

  const cubeRenderTarget = new WebGLCubeRenderTarget(config.resolution)
  cubeRenderTarget.texture.type = HalfFloatType

  const cubeCamera = new CubeCamera(config.near, config.far, cubeRenderTarget)

  const vScene = new Scene()
  vScene.add(cubeCamera)

  useRef(config, cubeRenderTarget.texture)

  return (
    <>
      <Portal element={vScene}>
        <CubeContainer
          renderPriority={config.renderPriority}
          frames={config.frames}
          cubeCamera={cubeCamera}
        >
          {config.children}
        </CubeContainer>
      </Portal>
      <Entity from={cubeRenderTarget.texture} {...rest} />
    </>
  )
}

// CubeContainer must be a separate component so that useFrame runs inside the
// Portal's own context (just like in RenderTexture).
function CubeContainer(props: {
  frames: number
  renderPriority: number
  cubeCamera: CubeCamera
  children: JSX.Element
}) {
  let count = 0
  const store = useThree()
  useFrame(
    () => {
      if (props.frames === Infinity || count < props.frames) {
        props.cubeCamera.update(store.gl, store.scene)
        count++
      }
    },
    { priority: props.renderPriority },
  )
  return <>{props.children}</>
}
