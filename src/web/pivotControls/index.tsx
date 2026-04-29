import type { ParentProps, Ref } from 'solid-js'
import { createEffect, createRenderEffect } from 'solid-js'
import { Entity, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { Group } from 'three'
import { processProps } from '@/utils'
import { AxisArrow } from './AxisArrow'
import { AxisRotator } from './AxisRotator'
import { PlaneSlider } from './PlaneSlider'
import type { OnDragStartProps } from './context'
import { context } from './context'

const tV0 = new THREE.Vector3()
const tV1 = new THREE.Vector3()
const tV2 = new THREE.Vector3()

type Size = { width: number; height: number }

function getPoint2(point3: THREE.Vector3, camera: THREE.Camera, size: Size) {
  const widthHalf = size.width / 2
  const heightHalf = size.height / 2
  camera.updateMatrixWorld(false)
  const vector = point3.project(camera)
  vector.x = vector.x * widthHalf + widthHalf
  vector.y = -(vector.y * heightHalf) + heightHalf
  return vector
}

function getPoint3(point2: THREE.Vector3, camera: THREE.Camera, size: Size, zValue: number = 1) {
  const vector = tV0.set((point2.x / size.width) * 2 - 1, -(point2.y / size.height) * 2 + 1, zValue)
  vector.unproject(camera)
  return vector
}

export function calculateScaleFactor(
  point3: THREE.Vector3,
  radiusPx: number,
  camera: THREE.Camera,
  size: Size,
) {
  const point2 = getPoint2(tV2.copy(point3), camera, size)
  let scale = 0
  for (let i = 0; i < 2; ++i) {
    const point2off = tV1.copy(point2).setComponent(i, point2.getComponent(i) + radiusPx)
    const point3off = getPoint3(point2off, camera, size, point2off.z)
    scale = Math.max(scale, point3.distanceTo(point3off))
  }
  return scale
}

const mL0 = new THREE.Matrix4()
const mW0 = new THREE.Matrix4()
const mP = new THREE.Matrix4()
const mPInv = new THREE.Matrix4()
const mW = new THREE.Matrix4()
const mL = new THREE.Matrix4()
const mL0Inv = new THREE.Matrix4()
const mdL = new THREE.Matrix4()

const bb = new THREE.Box3()
const bbObj = new THREE.Box3()
const vCenter = new THREE.Vector3()
const vSize = new THREE.Vector3()
const vAnchorOffset = new THREE.Vector3()
const vPosition = new THREE.Vector3()

const xDir = new THREE.Vector3(1, 0, 0)
const yDir = new THREE.Vector3(0, 1, 0)
const zDir = new THREE.Vector3(0, 0, 1)

interface PivotControlsProps extends ParentProps {
  ref?: Ref<THREE.Group>
  /** Scale of the gizmo, 1 */
  scale?: number
  /** Width of the gizmo lines, this is a THREE.Line2 prop, 2.5 */
  lineWidth?: number
  /** If fixed is true is remains constant in size, scale is now in pixels, false */
  fixed?: boolean
  /** Pivot does not act as a group, it won't shift contents but can offset in position */
  offset?: [number, number, number]
  /** Starting rotation */
  rotation?: [number, number, number]
  /** Starting matrix */
  matrix?: THREE.Matrix4
  /** BBAnchor, each axis can be between -1/0/+1 */
  anchor?: [number, number, number]
  /** If autoTransform is true, automatically apply the local transform on drag, true */
  autoTransform?: boolean
  /** Allows you to switch individual axes off */
  activeAxes?: [boolean, boolean, boolean]
  disableAxes?: boolean
  disableSliders?: boolean
  disableRotations?: boolean
  translationLimits?: [
    [number, number] | undefined,
    [number, number] | undefined,
    [number, number] | undefined,
  ]
  rotationLimits?: [
    [number, number] | undefined,
    [number, number] | undefined,
    [number, number] | undefined,
  ]
  /** RGB colors */
  axisColors?: [string | number, string | number, string | number]
  /** Color of the hovered item */
  hoveredColor?: string | number
  /** HTML value annotations, default: false */
  annotations?: boolean
  /** CSS Classname applied to the HTML annotations */
  annotationsClass?: string
  onDragStart?: (props: OnDragStartProps) => void
  onDrag?: (l: THREE.Matrix4, deltaL: THREE.Matrix4, w: THREE.Matrix4, deltaW: THREE.Matrix4) => void
  onDragEnd?: () => void
  /** Set this to false if you want the gizmo to be visible through faces */
  depthTest?: boolean
  opacity?: number
  visible?: boolean
  userData?: { [key: string]: any }
}

export function PivotControls(_props: PivotControlsProps) {
  const [config, rest] = processProps(
    _props,
    {
      autoTransform: true,
      disableAxes: false,
      disableSliders: false,
      disableRotations: false,
      activeAxes: [true, true, true] as [boolean, boolean, boolean],
      offset: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
      lineWidth: 4,
      fixed: false,
      depthTest: true,
      axisColors: ['#ff2060', '#20df80', '#2080ff'] as [string, string, string],
      hoveredColor: '#ffff40' as string | number,
      annotations: false,
      opacity: 1,
      visible: true,
    },
    [
      'ref',
      'matrix',
      'onDragStart',
      'onDrag',
      'onDragEnd',
      'autoTransform',
      'anchor',
      'disableAxes',
      'disableSliders',
      'disableRotations',
      'activeAxes',
      'offset',
      'rotation',
      'scale',
      'lineWidth',
      'fixed',
      'translationLimits',
      'rotationLimits',
      'depthTest',
      'axisColors',
      'hoveredColor',
      'annotations',
      'annotationsClass',
      'opacity',
      'visible',
      'userData',
      'children',
    ],
  )

  let parentRef: THREE.Group = null!
  let ref: THREE.Group = null!
  let gizmoRef: THREE.Group = null!
  let childrenRef: THREE.Group = null!
  const translation: [number, number, number] = [0, 0, 0]

  createRenderEffect(
    () => config.anchor,
    () => {
      if (!config.anchor) return
      childrenRef.updateWorldMatrix(true, true)

      mPInv.copy(childrenRef.matrixWorld).invert()
      bb.makeEmpty()
      childrenRef.traverse((obj: any) => {
        if (!obj.geometry) return
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox()
        mL.copy(obj.matrixWorld).premultiply(mPInv)
        bbObj.copy(obj.geometry.boundingBox)
        bbObj.applyMatrix4(mL)
        bb.union(bbObj)
      })
      vCenter.copy(bb.max).add(bb.min).multiplyScalar(0.5)
      vSize.copy(bb.max).sub(bb.min).multiplyScalar(0.5)
      vAnchorOffset
        .copy(vSize)
        .multiply(new THREE.Vector3(...config.anchor))
        .add(vCenter)
      vPosition.set(...config.offset).add(vAnchorOffset)
      gizmoRef.position.copy(vPosition)
    },
  )

  createRenderEffect(
    () => config.matrix,
    () => {
      if (config.matrix && config.matrix instanceof THREE.Matrix4) ref.matrix = config.matrix
    },
  )

  createEffect(
    () => config.ref,
    () => {
      if (typeof config.ref === 'function') config.ref(ref)
      else config.ref = ref
    },
  )

  const vector = new THREE.Vector3()
  const store = useThree()
  useFrame(() => {
    if (!config.fixed) return
    const sf = calculateScaleFactor(
      gizmoRef.getWorldPosition(vector),
      config.scale,
      store.camera,
      store.bounds,
    )
    if (!gizmoRef) return
    if (gizmoRef?.scale.x !== sf || gizmoRef?.scale.y !== sf || gizmoRef?.scale.z !== sf) {
      gizmoRef.scale.setScalar(sf)
    }
  })

  return (
    <context
      value={{
        onDragStart: (props: OnDragStartProps) => {
          mL0.copy(ref.matrix)
          mW0.copy(ref.matrixWorld)
          config.onDragStart && config.onDragStart(props)
        },
        onDrag: (mdW: THREE.Matrix4) => {
          mP.copy(parentRef.matrixWorld)
          mPInv.copy(mP).invert()
          mW.copy(mW0).premultiply(mdW)
          mL.copy(mW).premultiply(mPInv)
          mL0Inv.copy(mL0).invert()
          mdL.copy(mL).multiply(mL0Inv)
          if (config.autoTransform) ref.matrix.copy(mL)
          config.onDrag && config.onDrag(mL, mdL, mW, mdW)
        },
        onDragEnd: () => {
          if (config.onDragEnd) config.onDragEnd()
        },
        translation,
        get translationLimits() { return config.translationLimits },
        get rotationLimits() { return config.rotationLimits },
        get axisColors() { return config.axisColors },
        get hoveredColor() { return config.hoveredColor },
        get opacity() { return config.opacity },
        get scale() { return config.scale },
        get lineWidth() { return config.lineWidth },
        get fixed() { return config.fixed },
        get depthTest() { return config.depthTest },
        get userData() { return config.userData },
        get annotations() { return config.annotations },
        get annotationsClass() { return config.annotationsClass },
      }}
    >
      <Entity from={Group} ref={parentRef!}>
        <Entity from={Group} ref={ref!} matrix={config.matrix} matrixAutoUpdate={false} {...(rest as any)}>
          <Entity
            from={Group}
            visible={config.visible}
            ref={gizmoRef!}
            position={config.offset}
            rotation={config.rotation}
          >
            {!config.disableAxes && config.activeAxes[0] && <AxisArrow axis={0} direction={xDir} />}
            {!config.disableAxes && config.activeAxes[1] && <AxisArrow axis={1} direction={yDir} />}
            {!config.disableAxes && config.activeAxes[2] && <AxisArrow axis={2} direction={zDir} />}
            {!config.disableSliders && config.activeAxes[0] && config.activeAxes[1] && (
              <PlaneSlider axis={2} dir1={xDir} dir2={yDir} />
            )}
            {!config.disableSliders && config.activeAxes[0] && config.activeAxes[2] && (
              <PlaneSlider axis={1} dir1={zDir} dir2={xDir} />
            )}
            {!config.disableSliders && config.activeAxes[2] && config.activeAxes[1] && (
              <PlaneSlider axis={0} dir1={yDir} dir2={zDir} />
            )}
            {!config.disableRotations && config.activeAxes[0] && config.activeAxes[1] && (
              <AxisRotator axis={2} dir1={xDir} dir2={yDir} />
            )}
            {!config.disableRotations && config.activeAxes[0] && config.activeAxes[2] && (
              <AxisRotator axis={1} dir1={zDir} dir2={xDir} />
            )}
            {!config.disableRotations && config.activeAxes[2] && config.activeAxes[1] && (
              <AxisRotator axis={0} dir1={yDir} dir2={zDir} />
            )}
          </Entity>
          <Entity from={Group} ref={childrenRef!}>{config.children}</Entity>
        </Entity>
      </Entity>
    </context>
  )
}
