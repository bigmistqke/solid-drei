import { processProps } from '@/utils/process-props'
import { JSX, Ref, Show, createEffect, createMemo, onMount } from 'solid-js'
import { S3, T, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { useFBO } from './unported/useFBO'

interface PerspectiveCameraProps extends Omit<S3.Props<'PerspectiveCamera'>, 'children'> {
  ref: Ref<THREE.PerspectiveCamera>
  /** Registers the camera as the system default, fiber will start rendering with it */
  makeDefault?: boolean
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
 * Sets up a perspective camera using `THREE.PerspectiveCamera`.
 *
 * This camera can be made the default for rendering, manually controlled for precise adjustments,
 * and supports custom frame counts, resolution settings, and environment maps. The contents of the camera
 * can either follow the camera or be hidden when filming, based on the provided children prop.
 *
 * @example
 * export default () => {
 *   const cameraRef = useRef();
 *   return (
 *     <PerspectiveCamera makeDefault ref={cameraRef} />
 *   );
 * }
 *
 * @example
 * export default () => {
 *   let cameraRef;
 *   const envMap = new THREE.Texture();
 *   return (
 *     <PerspectiveCamera
 *       makeDefault
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
    ['ref', 'envMap', 'resolution', 'frames', 'makeDefault', 'children', 'manual'],
  )

  let camera: THREE.PerspectiveCamera
  let group: THREE.Group = null!
  let frameCount = 0
  let previousEnvMap: THREE.Color | THREE.Texture | null = null

  const store = useThree()
  const fbo = useFBO(config.resolution)

  const offspring = createMemo(() => {
    const offspring = config.children
    return {
      isFunctional: typeof offspring === 'function',
      elements: () => (typeof offspring === 'function' ? offspring(fbo.texture) : offspring),
    }
  })

  createEffect(() => {
    if (!offspring().isFunctional) return
    const scene = store.scene
    if (!(scene instanceof THREE.Scene)) return
    useFrame(state => {
      if (config.frames === Infinity || frameCount < config.frames) {
        group.visible = false
        state.gl.setRenderTarget(fbo)
        previousEnvMap = scene.background
        if (config.envMap) scene.background = config.envMap
        state.gl.render(scene, camera)
        scene.background = previousEnvMap
        state.gl.setRenderTarget(null)
        group.visible = true
        frameCount++
      }
    })
  })

  createEffect(() => {
    if (config.manual || !store.bounds.height) return
    camera.aspect = store.bounds.width / store.bounds.height
  })

  createEffect(() => config.makeDefault && store.setCamera(camera))

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(camera)
    else props.ref = camera
  })

  onMount(() => camera.updateProjectionMatrix())

  return (
    <>
      <T.PerspectiveCamera ref={camera!} {...rest}>
        <Show when={!offspring().isFunctional}>{offspring().elements()}</Show>
      </T.PerspectiveCamera>
      <T.Group ref={group}>
        <Show when={offspring().isFunctional}>{offspring().elements()}</Show>
      </T.Group>
    </>
  )
}
