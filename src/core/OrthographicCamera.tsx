import { whenever } from '@/utils/conditionals'
import { JSX, Ref, Show, createEffect, createMemo, onMount } from 'solid-js'
import { S3, T, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { OrthographicCamera as ThreeOrthographicCamera } from 'three'
import { processProps } from '../utils/process-props'
import { useFBO } from './unported/useFBO'

type OrthographicCameraProps = S3.ClassProps<typeof ThreeOrthographicCamera> & {
  ref: Ref<THREE.Camera>
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
 *     <OrthographicCamera makeDefault ref={cameraRef!} />
 *   );
 * }
 *
 * @example
 * export default () => {
 *   const cameraRef = useRef();
 *   const envMap = new THREE.Texture();
 *   return (
 *     <OrthographicCamera
 *       makeDefault
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
    ['ref', 'envMap', 'resolution', 'frames', 'children', 'makeDefault', 'manual'],
  )

  const store = useThree()
  const fbo = useFBO(config.resolution)
  let ref: THREE.OrthographicCamera
  let group: THREE.Group
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

  onMount(() => config.makeDefault && store.setCamera(ref))

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
        state.gl.render(scene, ref)
        scene.background = previousEnvMap
        state.gl.setRenderTarget(null)
        group.visible = true
        count++
      }
    })
  })

  createEffect(
    whenever(
      () => config.manual,
      () => {
        store.bounds
        ref.updateProjectionMatrix()
      },
    ),
  )

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(ref)
    else props.ref = ref
  })

  return (
    <>
      <T.OrthographicCamera
        left={store.bounds.width / -2}
        right={store.bounds.width / 2}
        top={store.bounds.height / 2}
        bottom={store.bounds.height / -2}
        ref={ref!}
        {...rest}
      >
        <Show when={!children().isFunctional}>{children().elements()}</Show>
      </T.OrthographicCamera>
      <T.Group ref={group!}>
        <Show when={children().isFunctional}>{children().elements()}</Show>
      </T.Group>
    </>
  )
}
