import { Accessor, JSXElement, Show, createMemo, createRenderEffect, onCleanup } from 'solid-js'
import { T, extend, useFrame, useThree } from 'solid-three'
import {
  CubeCamera,
  CubeTexture,
  HalfFloatType,
  Scene,
  Texture,
  WebGLCubeRenderTarget,
} from 'three'
import { GroundProjectedEnv as GroundProjectedEnvImpl } from 'three-stdlib'
import { whenever } from '../../utils/conditionals.ts'
import { defaultProps } from '../../utils/default-props.ts'
import { PresetsType } from '../../utils/environment-assets.ts'
import { processProps } from '../../utils/process-props.ts'
import { EnvironmentLoaderProps, useEnvironment } from './useEnvironment'

declare global {
  namespace SolidThree {
    interface Elements {
      GroundProjectedEnvImpl: GroundProjectedEnvImpl
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

const isAccessor = (obj: any): obj is Accessor<Scene> => typeof obj === 'function'
const resolveScene = (scene: Scene | Accessor<Scene>) => (isAccessor(scene) ? scene() : scene)

// s3f: we could mb prevent unnecessary cleanups by passing accessors instead of raw values
function setEnvProps(
  background: boolean | 'only',
  scene: Scene | Accessor<Scene> | undefined,
  defaultScene: Scene,
  texture: Texture,
  blur = 0,
) {
  const target = resolveScene(scene || defaultScene)
  const oldbg = target.background
  const oldenv = target.environment

  // @ts-ignore
  const oldBlur = target.backgroundBlurriness || 0
  if (background !== 'only') target.environment = texture
  if (background) target.background = texture
  // @ts-ignore
  if (background && target.backgroundBlurriness !== undefined) target.backgroundBlurriness = blur
  return () => {
    if (background !== 'only') target.environment = oldenv
    if (background) target.background = oldbg
    // @ts-ignore
    if (background && target.backgroundBlurriness !== undefined)
      target.backgroundBlurriness = oldBlur
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                   Environment                                  */
/*                                                                                */
/**********************************************************************************/

export interface EnvironmentProps extends EnvironmentLoaderProps {
  children?: JSXElement
  frames?: number
  near?: number
  far?: number
  resolution?: number
  background?: boolean | 'only'
  blur?: number
  map?: Texture
  preset?: PresetsType
  scene?: Scene | Accessor<Scene>
  ground?:
    | boolean
    | {
        radius?: number
        height?: number
        scale?: number
      }
}

export function EnvironmentMap(props: EnvironmentProps) {
  const config = defaultProps(props, { background: false })
  const store = useThree()
  createRenderEffect(() => {
    if (config.map) {
      const cleanup = setEnvProps(
        config.background,
        config.scene,
        store.scene,
        config.map,
        config.blur,
      )
      onCleanup(cleanup)
    }
  })
  return null
}

export function EnvironmentCube(props: EnvironmentProps) {
  const [config, rest] = processProps(props, { background: false }, ['background', 'scene', 'blur'])
  const texture = useEnvironment(rest)
  const store = useThree()

  createRenderEffect(
    whenever(texture, texture => {
      const cleanup = setEnvProps(
        config.background,
        config.scene,
        store.scene,
        texture,
        config.blur,
      )
      onCleanup(cleanup)
    }),
  )

  return null
}

export function EnvironmentPortal(props: EnvironmentProps) {
  const [config] = processProps(props, {
    near: 1,
    far: 1000,
    resolution: 256,
    frames: 1,
    background: false,
  })

  let camera: CubeCamera = null!
  const store = useThree()
  const virtualScene = new Scene()

  const fbo = createMemo(() => {
    const fbo = new WebGLCubeRenderTarget(config.resolution)
    fbo.texture.type = HalfFloatType
    return fbo
  }, [config.resolution])

  createRenderEffect(() => {
    if (config.frames === 1) camera.update(store.gl, virtualScene)
    const cleanup = setEnvProps(
      config.background,
      config.scene,
      store.scene,
      fbo().texture,
      config.blur,
    )
    onCleanup(cleanup)
  })

  let count = 1
  useFrame(() => {
    if (config.frames === Infinity || count < config.frames) {
      camera.update(store.gl, virtualScene)
      count++
    }
  })

  return (
    <T.Portal element={virtualScene}>
      {config.children}
      <T.CubeCamera ref={camera} args={[config.near, config.far, fbo()]} />
      {config.files || config.preset ? (
        <EnvironmentCube
          background
          files={config.files}
          preset={config.preset}
          path={config.path}
          extensions={config.extensions}
        />
      ) : config.map ? (
        <EnvironmentMap background map={config.map} extensions={config.extensions} />
      ) : null}
    </T.Portal>
  )
}

function EnvironmentGround(props: EnvironmentProps) {
  extend({ GroundProjectedEnvImpl })

  const textureDefault = useEnvironment(props)
  const texture = () => props.map || textureDefault()
  const args = createMemo<[CubeTexture | Texture | undefined]>(() => [texture()])

  return (
    <>
      <EnvironmentMap {...props} map={texture()} />
      <Show when={args()[0]}>
        <T.GroundProjectedEnvImpl
          args={args()}
          scale={props.ground?.scale ?? 1000}
          height={props.ground?.height}
          radius={props.ground?.radius}
        />
      </Show>
    </>
  )
}

export function Environment(props: EnvironmentProps) {
  return createMemo(() =>
    props.ground ? (
      <EnvironmentGround {...props} />
    ) : props.map ? (
      <EnvironmentMap {...props} />
    ) : props.children ? (
      <EnvironmentPortal {...props} />
    ) : (
      <EnvironmentCube {...props} />
    ),
  )
}
