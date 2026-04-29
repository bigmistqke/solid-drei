import { useRef } from '@/utils'
import ThreeCameraControls from 'camera-controls'
import { createEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import {
  Box3,
  MathUtils,
  Matrix4,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from 'three'
import { ControlUtils } from './control-utils'

export type CameraControls = ThreeCameraControls

export interface CameraControlsProps {
  ref?: ThreeCameraControls | ((value: S3.Meta<ThreeCameraControls>) => void)
  camera?: PerspectiveCamera | OrthographicCamera
  domElement?: HTMLElement
  makeCurrent?: boolean
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

  const store = useThree()
  const camera = () => ControlUtils.getCamera(store, props)
  const element = () => ControlUtils.getDomElement(store, props)
  const controls = createMemo(() => new ThreeCameraControls(camera(), element()))

  ControlUtils.initialize(controls, element, store, props)

  createEffect(
    () => props.onChange,
    (onChange) => {
      if (!onChange) return
      ControlUtils.addEventHandler(controls, 'control', onChange)
      ControlUtils.addEventHandler(controls, 'update', onChange)
      ControlUtils.addEventHandler(controls, 'transitionstart', onChange)
      ControlUtils.addEventHandler(controls, 'wake', onChange)
    }
  )
  createEffect(
    () => props.onStart,
    (onStart) => {
      if (!onStart) return
      ControlUtils.addEventHandler(controls, 'controlstart', onStart)
    }
  )
  createEffect(
    () => props.onEnd,
    (onEnd) => {
      if (!onEnd) return
      ControlUtils.addEventHandler(controls, 'controlend', onEnd)
    }
  )

  useRef(props, controls)

  return <Entity from={controls()} />
}
