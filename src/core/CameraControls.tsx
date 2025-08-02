import ThreeCameraControls from 'camera-controls'
import { Ref, createEffect, createMemo, splitProps } from 'solid-js'
import { S3, T, useThree } from 'solid-three'
import {
  Box3,
  Event,
  MathUtils,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from 'three'
import { ControlUtils } from './control-utils.ts'

export type CameraControls = ThreeCameraControls

export interface CameraControlsProps extends S3.ClassProps<typeof ThreeCameraControls> {
  ref?: Ref<ThreeCameraControls>
  camera?: PerspectiveCamera | OrthographicCamera
  domElement?: HTMLElement
  makeDefault?: boolean
  onStart?: (e: Event) => void
  onEnd?: (e: Event) => void
  onChange?: (e: Event) => void
  events?: boolean // Wether to enable events during controls interaction
  regress?: boolean
}

export function CameraControls(props: CameraControlsProps) {
  // to allow for tree shaking, we only import the subset of THREE that is used by camera-controls
  // see https://github.com/yomotsu/camera-controls#important
  ThreeCameraControls.install({
    THREE: {
      Box3,
      MathUtils: {
        clamp: MathUtils.clamp,
      },
      Matrix4,
      Quaternion,
      Raycaster,
      Sphere,
      Spherical,
      Vector2,
      Vector3,
      Vector4,
    },
  })

  const [config, rest] = splitProps(props, [
    'ref',
    'camera',
    'domElement',
    'makeDefault',
    'onStart',
    'onEnd',
    'onChange',
    'regress',
  ])
  const store = useThree()
  const camera = () => ControlUtils.getCamera(store, config)
  const element = () => ControlUtils.getDomElement(store, config)
  const controls = createMemo(() => new ThreeCameraControls(camera(), element()))

  ControlUtils.initialize(controls, element, store, config)

  createEffect(() => {
    if (!config.onChange) return
    ControlUtils.addEventHandler(controls, 'control', config.onChange)
    ControlUtils.addEventHandler(controls, 'update', config.onChange)
    ControlUtils.addEventHandler(controls, 'transitionstart', config.onChange)
    ControlUtils.addEventHandler(controls, 'wake', config.onChange)
  })
  createEffect(() => {
    if (!config.onStart) return
    ControlUtils.addEventHandler(controls, 'controlstart', config.onStart)
  })
  createEffect(() => {
    if (!config.onEnd) return
    ControlUtils.addEventHandler(controls, 'controlend', config.onEnd)
  })

  return <T.Primitive ref={config.ref} object={controls()} {...rest} />
}
