import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import {
  createContext,
  createEffect,
  createSignal,
  onMount,
  Show,
  omit,
  useContext,
} from 'solid-js'
import type { S3 } from 'solid-three'
import { createT, Entity, useFrame } from 'solid-three'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  Matrix4,
  Ray,
  Raycaster,
  Sphere,
  Points as ThreePoints,
  Vector3,
  type Intersection,
} from 'three'

const T = createT({ BufferAttribute, BufferGeometry })

/**********************************************************************************/
/*                                                                                */
/*                                 Position Point                                 */
/*                                                                                */
/**********************************************************************************/

const _inverseMatrix = /*@__PURE__*/ new Matrix4()
const _ray = /*@__PURE__*/ new Ray()
const _sphere = /*@__PURE__*/ new Sphere()
const _position = /*@__PURE__*/ new Vector3()

export class PositionPoint extends Group {
  size: number
  color: Color
  instance: ThreePoints | undefined
  instanceKey: S3.Props<typeof PositionPoint> | undefined
  constructor() {
    super()
    this.size = 0
    this.color = new Color('white')
    this.instance = undefined
    this.instanceKey = undefined
  }

  // This will allow the virtual instance have bounds
  get geometry() {
    return this.instance?.geometry
  }

  raycast(raycaster: Raycaster, intersects: Intersection[]) {
    const parent = this.instance
    if (!parent || !parent.geometry) return
    const instanceId = parent.userData.instances.indexOf(this.instanceKey)
    // If the instance wasn't found or exceeds the parents draw range, bail out
    if (instanceId === -1 || instanceId > parent.geometry.drawRange.count) return

    const threshold = raycaster.params.Points?.threshold ?? 1
    _sphere.set(this.getWorldPosition(_position), threshold)
    if (raycaster.ray.intersectsSphere(_sphere) === false) return

    _inverseMatrix.copy(parent.matrixWorld).invert()
    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix)

    const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3)
    const localThresholdSq = localThreshold * localThreshold
    const rayPointDistanceSq = _ray.distanceSqToPoint(this.position)

    if (rayPointDistanceSq < localThresholdSq) {
      const intersectPoint = new Vector3()
      _ray.closestPointToPoint(this.position, intersectPoint)
      intersectPoint.applyMatrix4(this.matrixWorld)
      const distance = raycaster.ray.origin.distanceTo(intersectPoint)
      if (distance < raycaster.near || distance > raycaster.far) return
      intersects.push({
        distance: distance,
        distanceToRay: Math.sqrt(rayPointDistanceSq),
        point: intersectPoint,
        index: instanceId,
        face: null,
        object: this,
      })
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                 Point Context                                  */
/*                                                                                */
/**********************************************************************************/

interface PointContext {
  getParent: () => ThreePoints
  subscribe: (ref: any) => void
}

const pointContext = /*@__PURE__*/ createContext<PointContext>(null!)
const usePointContext = () => {
  const context = useContext(pointContext)
  if (!context) throw 'usePoint should be used inside `<PointInstances/>'
  return context
}

/**********************************************************************************/
/*                                                                                */
/*                                Points Instances                                */
/*                                                                                */
/**********************************************************************************/

interface PointsInstancesProps extends S3.Props<ThreePoints> {
  range?: number
  limit?: number
}

const parentMatrix = /*@__PURE__*/ new Matrix4()
const position = /*@__PURE__*/ new Vector3()

/**
 * Instance implementation, relies on react + context to update the attributes based on the children of this component
 */
function PointsInstances(props: PointsInstancesProps) {
  const [config, rest] = processProps(props, { limit: 1000 }, [
    'args',
    'children',
    'limit',
    'range',
    'ref',
  ])
  const [refs, setRefs] = createSignal<PositionPoint[]>([])
  const [positions, colors, sizes] = [
    new Float32Array(config.limit * 3),
    Float32Array.from({ length: config.limit * 3 }, () => 1),
    Float32Array.from({ length: config.limit }, () => 1),
  ]

  const parent = new ThreePoints()

  createEffect(
    () => parent.geometry.attributes.position,
    (attr) => {
      if (!attr) return
      attr.needsUpdate = true
    },
  )

  useFrame(() => {
    parent.updateMatrix()
    parent.updateMatrixWorld()
    parentMatrix.copy(parent.matrixWorld).invert()

    parent.geometry.drawRange.count = Math.min(
      config.limit,
      config.range !== undefined ? config.range : config.limit,
      refs().length,
    )

    for (let index = 0; index < refs().length; index++) {
      const positionRef = refs()[index]!
      positionRef.getWorldPosition(position).applyMatrix4(parentMatrix)
      position.toArray(positions, index * 3)
      if (parent.geometry.attributes.position) {
        parent.geometry.attributes.position.needsUpdate = true
      }
      positionRef.matrixWorldNeedsUpdate = true
      positionRef.color.toArray(colors, index * 3)
      if (parent.geometry.attributes.color) {
        parent.geometry.attributes.color.needsUpdate = true
      }
      sizes.set([positionRef.size], index)
      if (parent.geometry.attributes.size) {
        parent.geometry.attributes.size.needsUpdate = true
      }
    }
  })

  useRef(config, parent)

  return (
    <Entity
      from={parent}
      userData={{
        get instances() {
          return refs()
        },
      }}
      matrixAutoUpdate={false}
      raycast={() => null}
      {...rest}
    >
      <T.BufferGeometry>
        <T.BufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          usage={DynamicDrawUsage}
        />
        <T.BufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          usage={DynamicDrawUsage}
        />
        <T.BufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          usage={DynamicDrawUsage}
        />
      </T.BufferGeometry>
      <pointContext.Provider
        value={{
          getParent: () => parent,
          subscribe: ref => {
            setRefs(refs => [...refs, ref])
            // return cleanup function
            return () => setRefs(refs => refs.filter(item => item !== ref))
          },
        }}
      >
        {config.children}
      </pointContext.Provider>
    </Entity>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                     Point                                    */
/*                                                                                */
/**********************************************************************************/

export function Point(props: S3.Props<PositionPoint>) {
  const rest = omit(props, 'ref', 'children')

  const positionPoint = new PositionPoint()
  const pointContext = usePointContext()

  onMount(() => {
    pointContext.subscribe(positionPoint)
  })

  useRef(props, positionPoint)

  return (
    <Entity from={positionPoint} instance={pointContext.getParent()} {...rest}>
      {props.children}
    </Entity>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                 Points Buffer                                  */
/*                                                                                */
/**********************************************************************************/

/**
 * Buffer implementation, relies on complete buffers of the correct number,
 * leaves it to the user to update them
 */
interface PointsBufferProps extends S3.Props<ThreePoints> {
  // a buffer containing all points position
  positions: Float32Array
  colors?: Float32Array
  sizes?: Float32Array
  // The size of the points in the buffer
  stride?: 2 | 3
}

export function PointsBuffer(props: PointsBufferProps) {
  const [config, rest] = processProps(props, { stride: 3 }, [
    'ref',
    'children',
    'positions',
    'colors',
    'sizes',
    'stride',
  ])

  const points = new ThreePoints()

  useFrame(() => {
    if (!points) return

    const attr = points.geometry.attributes
    if (!attr || !attr.position) return
    attr.position.needsUpdate = true

    if (config.colors && attr.color) attr.color.needsUpdate = true
    if (config.sizes && attr.size) attr.size.needsUpdate = true
  })

  useRef(config, points)

  return (
    <Entity from={points} {...rest}>
      <T.BufferGeometry>
        <T.BufferAttribute
          attach="attributes-position"
          count={config.positions.length / config.stride}
          array={config.positions}
          itemSize={config.stride}
          usage={DynamicDrawUsage}
        />
        <Show when={config.colors}>
          <T.BufferAttribute
            attach="attributes-color"
            count={config.colors!.length / config.stride}
            array={config.colors}
            itemSize={3}
            usage={DynamicDrawUsage}
          />
        </Show>
        <Show when={config.sizes}>
          <T.BufferAttribute
            attach="attributes-size"
            count={config.sizes!.length / config.stride}
            array={config.sizes}
            itemSize={1}
            usage={DynamicDrawUsage}
          />
        </Show>
      </T.BufferGeometry>
      {config.children}
    </Entity>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                     Points                                     */
/*                                                                                */
/**********************************************************************************/

type PointsProps = (PointsBufferProps | PointsInstancesProps) & { ref?: Ref<ThreePoints> }

export function Points(props: PointsProps) {
  return (
    <Show
      when={(props as PointsBufferProps).positions instanceof Float32Array}
      fallback={<PointsInstances {...(props as PointsInstancesProps)} />}
    >
      <PointsBuffer {...(props as PointsBufferProps)} />
    </Show>
  )
}
