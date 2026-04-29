import { defaultProps, useRef } from '@/utils'
import { createEffect, createMemo, type Ref } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import {
  CatmullRomCurve3,
  CurvePath,
  MathUtils,
  Object3D,
  Quaternion,
  Vector3,
  type Curve,
} from 'three'

export interface MotionPathControls {
  /** Current progress along the path, 0–1 */
  readonly current: number
  /** Manually set progress */
  set(t: number): void
  /** Force an immediate update */
  update(): void
}

export interface MotionPathControlsProps {
  ref?: Ref<MotionPathControls>
  /** Object to animate along the path. Defaults to the scene camera. */
  object?: Object3D
  /** Array of curves that make up the path */
  curves?: Curve<Vector3>[]
  /** Optional focus target – the object will look at this point/object */
  focus?: Object3D | Vector3
  /** Loop the animation */
  loop?: boolean
  /** Starting offset, 0–1 */
  offset?: number
  /** Animation speed (path-units per second) */
  speed?: number
  /** Position damping factor (higher = snappier) */
  damping?: number
  /** Focus/rotation damping factor */
  focusDamping?: number
  /** Maximum speed clamp */
  maxSpeed?: number
  /** Whether animation is playing */
  enabled?: boolean
}

export function MotionPathControls(props: MotionPathControlsProps) {
  const store = useThree()

  const config = defaultProps(props, {
    curves: [] as Curve<Vector3>[],
    loop: false,
    offset: 0,
    speed: 0.1,
    damping: 10,
    focusDamping: 10,
    maxSpeed: Infinity,
    enabled: true,
  })

  // Current raw progress (0–1), mutable
  let progress = config.offset

  // Smoothed position/quaternion for damping
  const smoothPos = new Vector3()
  const smoothQuat = new Quaternion()
  const targetPos = new Vector3()
  const targetQuat = new Quaternion()
  const lookAtDir = new Vector3()
  const upDir = new Vector3(0, 1, 0)
  let initialised = false

  // Build a CurvePath from the provided curves
  const path = createMemo<CurvePath<Vector3> | CatmullRomCurve3 | null>(() => {
    const curves = config.curves
    if (!curves || curves.length === 0) return null

    if (curves.length === 1) {
      return curves[0] as unknown as CatmullRomCurve3
    }

    const cp = new CurvePath<Vector3>()
    for (const curve of curves) {
      cp.add(curve)
    }
    return cp
  })

  const api: MotionPathControls = {
    get current() {
      return progress
    },
    set(t: number) {
      progress = MathUtils.clamp(t, 0, 1)
    },
    update() {
      const obj = config.object ?? store.camera
      const p = path()
      if (!p || !obj) return

      targetPos.copy(p.getPoint(progress))
      obj.position.copy(targetPos)
    },
  }

  useRef(props, api)

  createEffect(() => {
    // Reset initialised flag when path changes so damping snaps
    path()
    initialised = false
  })

  useFrame((_, delta) => {
    if (!config.enabled) return

    const p = path()
    const obj = config.object ?? store.camera
    if (!p || !obj) return

    // Advance progress
    const speed = Math.min(config.speed * delta, config.maxSpeed * delta)
    progress += speed
    if (config.loop) {
      progress = progress % 1
    } else {
      progress = Math.min(progress, 1)
    }

    // Get position on path
    p.getPoint(progress, targetPos)

    // Get tangent for orientation (slightly ahead on path)
    const lookAheadT = (progress + 0.001) % 1
    const lookAheadPos = p.getPoint(Math.min(lookAheadT, 1))

    if (!initialised) {
      smoothPos.copy(targetPos)
      initialised = true
    }

    // Damp position
    const dampFactor = Math.min(1, config.damping * delta)
    smoothPos.lerp(targetPos, dampFactor)
    obj.position.copy(smoothPos)

    // Orientation
    const focusTarget = config.focus
    if (focusTarget) {
      if (focusTarget instanceof Object3D) {
        lookAtDir.copy(focusTarget.position).sub(smoothPos).normalize()
      } else {
        lookAtDir.copy(focusTarget as Vector3).sub(smoothPos).normalize()
      }
    } else {
      lookAtDir.copy(lookAheadPos).sub(smoothPos).normalize()
    }

    // Build target quaternion from look direction
    const lookAtMatrix = obj.matrix.clone()
    lookAtMatrix.lookAt(smoothPos, smoothPos.clone().add(lookAtDir), upDir)
    targetQuat.setFromRotationMatrix(lookAtMatrix)

    // Damp rotation
    const focusDampFactor = Math.min(1, config.focusDamping * delta)
    smoothQuat.slerp(targetQuat, focusDampFactor)
    obj.quaternion.copy(smoothQuat)
  })

  return null
}
