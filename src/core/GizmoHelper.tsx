import { assertedNotNullish, defaultProps } from '@/utils'
import { createContext, createEffect, useContext } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame, useThree } from 'solid-three'
import {
  Group,
  Matrix4,
  Object3D,
  OrthographicCamera as OrthographicCameraImpl,
  Quaternion,
  Vector3,
} from 'three'
import { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { OrthographicCamera } from '..'
import { Hud } from './Hud'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

type ControlsProto = { update(): void; target: Vector3 }

const isOrbitControls = (controls: ControlsProto): controls is OrbitControlsType => {
  return controls && 'minPolarAngle' in (controls as OrbitControlsType)
}

/**********************************************************************************/
/*                                                                                */
/*                              Gizmo Helper Context                              */
/*                                                                                */
/**********************************************************************************/

type GizmoHelperContext = {
  tweenCamera: (direction: Vector3) => void
}
const gizmoHelperContext = createContext<GizmoHelperContext>()
const GizmoHelperContext = gizmoHelperContext
export const useGizmoContext = () => assertedNotNullish(useContext(gizmoHelperContext))

/**********************************************************************************/
/*                                                                                */
/*                                  Gizmo Helper                                  */
/*                                                                                */
/**********************************************************************************/

const turnRate = 2 * Math.PI // turn rate in angles per second
const dummy = new Object3D()
const matrix = new Matrix4()
const [q1, q2] = [new Quaternion(), new Quaternion()]
const target = new Vector3()
const targetPosition = new Vector3()

export interface GizmoHelperProps extends S3.Props<Group> {
  alignment?:
    | 'top-left'
    | 'top-right'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'center-right'
    | 'center-left'
    | 'center-center'
    | 'top-center'
  margin?: [number, number]
  renderPriority?: number
  autoClear?: boolean
  onUpdate?: () => void // update controls during animation
  // TODO: in a new major state.controls should be the only means of consuming controls, the
  // onTarget prop can then be removed!
  onTarget?: () => Vector3 // return the target to rotate around
}

export const GizmoHelper = (props: GizmoHelperProps): any => {
  const config = defaultProps(props, {
    alignment: 'bottom-right',
    margin: [80, 80],
    renderPriority: 1,
  })
  const store = useThree()

  let gizmo: Group = null!
  let camera: OrthographicCameraImpl = null!

  let animating = false
  let defaultUp = new Vector3(0, 0, 0)
  let focusPoint = new Vector3(0, 0, 0)
  let radius = 0

  function tweenCamera(direction: Vector3) {
    animating = true

    if (/* store.controls || */ config.onTarget) {
      focusPoint = /* store.controls?.target || */ config.onTarget?.()
    }

    radius = store.camera.position.distanceTo(target)

    // Rotate from current camera orientation
    q1.copy(store.camera.quaternion)

    // To new current camera orientation
    targetPosition.copy(direction).multiplyScalar(radius).add(target)

    dummy.lookAt(targetPosition)
    dummy.up.copy(store.camera.up)

    q2.copy(dummy.quaternion)

    // store.invalidate()
  }

  // Position gizmo component within scene
  function position() {
    const [marginX, marginY] = config.margin
    const x = config.alignment.endsWith('-center')
      ? 0
      : config.alignment.endsWith('-left')
      ? -store.bounds.width / 2 + marginX
      : store.bounds.width / 2 - marginX
    const y = config.alignment.startsWith('center-')
      ? 0
      : config.alignment.startsWith('top-')
      ? store.bounds.height / 2 - marginY
      : -store.bounds.height / 2 + marginY

    return [x, y, 0] as [number, number, number]
  }

  useFrame((_, delta) => {
    if (!camera || !gizmo) return

    // Animate step
    if (animating) {
      if (q1.angleTo(q2) < 0.01) {
        animating = false
        // // Orbit controls uses UP vector as the orbit axes,
        // // so we need to reset it after the animation is done
        // // moving it around for the controls to work correctly
        // if (isOrbitControls(store.controls as any as ControlsProto)) {
        store.camera.up.copy(defaultUp)
        // }
      } else {
        const step = delta * turnRate
        // animate position by doing a slerp and then scaling the position on the unit sphere
        q1.rotateTowards(q2, step)
        // animate orientation
        store.camera.position
          .set(0, 0, 1)
          .applyQuaternion(q1)
          .multiplyScalar(radius)
          .add(focusPoint)
        store.camera.up.set(0, 1, 0).applyQuaternion(q1).normalize()
        store.camera.quaternion.copy(q1)
        if (config.onUpdate) config.onUpdate()
        // else if (store.controls) (store.controls as any as ControlsProto).update()
      }
    }

    // Sync Gizmo with main camera orientation
    matrix.copy(store.camera.matrix).invert()
    gizmo?.quaternion.setFromRotationMatrix(matrix)
  })

  createEffect(
    () => store.camera.up,
    (up) => {
      defaultUp.copy(up)
    }
  )

  return (
    <Hud renderPriority={config.renderPriority}>
      <GizmoHelperContext
        value={{
          tweenCamera,
        }}
      >
        <OrthographicCamera makeCurrent ref={camera!} position={[0, 0, 200]} />
        <Entity from={Group} ref={gizmo!} position={position()}>
          {config.children}
        </Entity>
      </GizmoHelperContext>
    </Hud>
  )
}
