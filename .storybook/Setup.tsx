import { OrbitControls, type OrthographicCamera, type PerspectiveCamera } from '@/core'
import { processProps } from '@/utils/process-props'
import { Show, type JSX, type ParentComponent } from 'solid-js'
import { Canvas, createT, type S3 } from 'solid-three'
import * as THREE from 'three'
import { Camera, Raycaster, Scene, Vector3, WebGLRenderer } from 'three'

const T = createT(THREE)

type Props = {
  /** Configuration for the camera used in the scene. */
  camera?:
    | Partial<S3.Props<typeof PerspectiveCamera> | S3.Props<typeof OrthographicCamera>>
    | Camera
  /** Element to render while the main content is loading asynchronously.  */
  fallback?: JSX.Element
  /** Options for the WebGLRenderer or a function returning a customized renderer. */
  gl?:
    | Partial<S3.Props<WebGLRenderer>>
    | ((canvas: HTMLCanvasElement) => WebGLRenderer)
    | WebGLRenderer
  /** Toggles between Orthographic and Perspective camera. */
  orthographic?: boolean
  /** Configuration for the Raycaster used for mouse and pointer events. */
  raycaster?: Partial<S3.Props<Raycaster>> | Raycaster
  /** Configuration for the Scene instance. */
  scene?: Partial<S3.Props<Scene>> | Scene
  /** Custom CSS styles for the canvas container. */
  style?: JSX.CSSProperties
  /** Enables and configures shadows in the scene. */
  shadows?: boolean | 'basic' | 'percentage' | 'soft' | 'variance' | WebGLRenderer['shadowMap']
  /** Toggles linear interpolation for texture filtering. */
  linear?: boolean
  /** Toggles flat interpolation for texture filtering. */
  flat?: boolean
  /** Controls the rendering loop's operation mode. */
  frameloop?: 'never' | 'demand' | 'always'
  cameraFov?: number
  cameraPosition?: Vector3
  controls?: boolean
  lights?: boolean
}

export const Setup: ParentComponent<Props> = _props => {
  const [props, rest] = processProps(
    _props,
    {
      cameraFov: 75,
      cameraPosition: new Vector3(0, 0, 0),
      controls: true,
      lights: true,
    },
    ['cameraFov', 'cameraPosition', 'controls', 'lights', 'children'],
  )

  return (
    <Canvas shadows camera={{ position: props.cameraPosition, fov: props.cameraFov }} {...rest}>
      <T.Color attach="background" args={['black']} />
      {props.children}
      <Show when={props.lights}>
        <T.AmbientLight intensity={0.8} />
        <T.PointLight intensity={1} position={[0, 6, 0]} />
      </Show>
      <Show when={props.controls}>
        <OrbitControls makeDefault />
      </Show>
    </Canvas>
  )
}
