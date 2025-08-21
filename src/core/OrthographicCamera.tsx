import { when } from '@/utils/conditionals'
import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { JSX, Ref } from 'solid-js'
import { createEffect, createMemo, onCleanup, Show } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { OrthographicCamera as ThreeOrthographicCamera } from 'three'
import { useFBO } from './unported/useFBO'

type OrthographicCameraProps = S3.Props<ThreeOrthographicCamera> & {
  ref?: Ref<THREE.Camera>
  /** Registers the camera as the system default, fiber will start rendering with it */
  makeCurrent?: boolean
  /** Making it manual will stop responsiveness and you have to calculate aspect ratio yourself. */
  manual?: boolean
  /** The contents will either follow the camera, or be hidden when filming if you pass a function */
  children?: JSX.Element | ((texture: THREE.Texture) => JSX.Element)
  /** Number of frames to render, default is Infinity */
  frames?: number
  /** Resolution of the FBO, default is 256 */
  resolution?: number
  /** Optional environment map for functional use */
  envMap?: THREE.Texture
}

/**
 * Sets up an orthographic camera using `THREE.OrthographicCamera`.
 *
 * This camera can be made the default for rendering, manually controlled for precise adjustments,
 * and supports custom frame counts, resolution settings, and environment maps. The contents of the camera
 * can either follow the camera or be hidden when filming, based on the provided children prop.
 *
 * @example
 * export default () => {
 *   let cameraRef;
 *   return (
 *     <OrthographicCamera makeCurrent ref={cameraRef!} />
 *   );
 * }
 *
 * @example
 * export default () => {
 *   const cameraRef = useRef();
 *   const envMap = new THREE.Texture();
 *   return (
 *     <OrthographicCamera
 *       makeCurrent
 *       manual
 *       frames={100}
 *       resolution={512}
 *       envMap={envMap}
 *       ref={cameraRef}
 *     >
 *       {(texture) => <T.MeshBasicMaterial map={texture} />}
 *     </OrthographicCamera>
 *   );
 * }
 *
 * @note
 * Ensure to manage the aspect ratio manually if `manual` prop is set to true.
 *
 * @link https://threejs.org/docs/#api/en/cameras/OrthographicCamera
 */
export function OrthographicCamera(props: OrthographicCameraProps) {
  const [config, rest] = processProps(
    props,
    {
      resolution: 256,
      frames: Infinity,
    },
    ['args', 'children', 'envMap', 'frames', 'makeCurrent', 'manual', 'ref', 'resolution'],
  )

  const store = useThree()

  const camera = createMemo(() => new ThreeOrthographicCamera(...(config.args ?? [])))
  const fbo = useFBO(config.resolution)
  const group = new THREE.Group()

  let count = 0
  let previousEnvMap: THREE.Color | THREE.Texture | null = null

  const children = createMemo(() => {
    const offspring = config.children
    const isFunctional = typeof offspring === 'function'
    return {
      isFunctional,
      elements: () => (typeof offspring === 'function' ? offspring(fbo.texture) : offspring),
    }
  })

  createEffect(() => {
    if (config.makeCurrent) {
      onCleanup(store.setCurrentCamera(camera()))
    }
  })

  createEffect(() => {
    if (!children().isFunctional) return
    const scene = store.scene
    if (!(scene instanceof THREE.Scene)) return
    useFrame(state => {
      if (config.frames === Infinity || count < config.frames) {
        group.visible = false
        state.gl.setRenderTarget(fbo)
        previousEnvMap = scene.background
        if (config.envMap) scene.background = config.envMap
        state.gl.render(scene, camera())
        scene.background = previousEnvMap
        state.gl.setRenderTarget(null)
        group.visible = true
        count++
      }
    })
  })

  createEffect(
    when(
      () => config.manual,
      () => {
        store.bounds
        camera().updateProjectionMatrix()
      },
    ),
  )

  useRef(props, camera)

  return (
    <>
      <Entity
        from={camera()}
        left={store.bounds.width / -2}
        right={store.bounds.width / 2}
        top={store.bounds.height / 2}
        bottom={store.bounds.height / -2}
        {...rest}
      >
        <Show when={!children().isFunctional}>{children().elements()}</Show>
      </Entity>
      <Entity from={group}>
        <Show when={children().isFunctional}>{children().elements()}</Show>
      </Entity>
    </>
  )
}
