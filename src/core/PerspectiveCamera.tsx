import { processProps, useRef } from '@/utils'
import type { JSX, Ref } from 'solid-js'
import { Show, createEffect, createMemo, onCleanup } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame, useThree } from 'solid-three'
import { Color, Group, Scene, Texture, PerspectiveCamera as ThreePerspectiveCamera } from 'three'
import { useFBO } from './unported/useFBO'

interface PerspectiveCameraProps extends Omit<S3.Props<ThreePerspectiveCamera>, 'children'> {
  ref?: Ref<ThreePerspectiveCamera>
  /** Registers the camera as the system default, fiber will start rendering with it */
  makeCurrent?: boolean
  /** Making it manual will stop responsiveness and you have to calculate aspect ratio yourself. */
  manual?: boolean
  /** The contents will either follow the camera, or be hidden when filming if you pass a function */
  children?: JSX.Element | ((texture: Texture) => JSX.Element)
  /** Number of frames to render, default is Infinity */
  frames?: number
  /** Resolution of the FBO, default is 256 */
  resolution?: number
  /** Optional environment map for functional use */
  envMap?: Texture
}

/**
 * Sets up a perspective camera using `ThreePerspectiveCamera`.
 *
 * This camera can be made the default for rendering, manually controlled for precise adjustments,
 * and supports custom frame counts, resolution settings, and environment maps. The contents of the camera
 * can either follow the camera or be hidden when filming, based on the provided children prop.
 *
 * @example
 * export default () => {
 *   const cameraRef = useRef();
 *   return (
 *     <PerspectiveCamera makeCurrent ref={cameraRef} />
 *   );
 * }
 *
 * @example
 * export default () => {
 *   let cameraRef;
 *   const envMap = new Texture();
 *   return (
 *     <PerspectiveCamera
 *       makeCurrent
 *       manual
 *       frames={100}
 *       resolution={512}
 *       envMap={envMap}
 *       ref={cameraRef}
 *     >
 *       {(texture) => <T.MeshBasicMaterial map={texture} />}
 *     </PerspectiveCamera>
 *   );
 * }
 *
 * @note
 * Ensure to manage the aspect ratio manually if `manual` prop is set to true.
 *
 * @link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
 */
export function PerspectiveCamera(props: PerspectiveCameraProps) {
  const [config, rest] = processProps(
    props,
    {
      resolution: 256,
      frames: Infinity,
    },
    ['args', 'ref', 'envMap', 'resolution', 'frames', 'makeCurrent', 'children', 'manual'],
  )

  const store = useThree()

  const camera = createMemo(() => new ThreePerspectiveCamera(...(config.args ?? [])))
  const fbo = useFBO(config.resolution)
  const group = new Group()

  let frameCount = 0
  let previousEnvMap: Color | Texture | null = null

  const offspring = createMemo(() => {
    const offspring = config.children
    return {
      isFunctional: typeof offspring === 'function',
      elements: () => (typeof offspring === 'function' ? offspring(fbo.texture) : offspring),
    }
  })

  createEffect(
    () => offspring().isFunctional,
    (isFunctional) => {
      if (!isFunctional) return
      const scene = store.scene
      if (!(scene instanceof Scene)) return
      useFrame(state => {
        if (config.frames === Infinity || frameCount < config.frames) {
          group.visible = false
          state.gl.setRenderTarget(fbo)
          previousEnvMap = scene.background
          if (config.envMap) scene.background = config.envMap
          state.gl.render(scene, camera())
          scene.background = previousEnvMap
          state.gl.setRenderTarget(null)
          group.visible = true
          frameCount++
        }
      })
    }
  )

  createEffect(
    () => [config.manual, store.bounds.width, store.bounds.height] as const,
    ([manual, width, height]) => {
      if (manual || !height) return
      camera().aspect = width / height
    }
  )

  createEffect(
    () => {
      if (config.makeCurrent) {
        onCleanup(store.setCamera(camera()))
      }
    }
  )

  createEffect(() => {
    camera().updateProjectionMatrix()
  })

  useRef(props, camera)

  return (
    <>
      <Entity from={camera()} {...rest}>
        <Show when={!offspring().isFunctional}>{offspring().elements()}</Show>
      </Entity>
      <Entity from={group}>
        <Show when={offspring().isFunctional}>{offspring().elements()}</Show>
      </Entity>
    </>
  )
}
