import {
  Ref,
  Show,
  createContext,
  createEffect,
  createSignal,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'
import { S3, T, extend, useFrame } from 'solid-three'
import * as THREE from 'three'
import { processProps } from '../utils/process-props.ts'

declare global {
  namespace SolidThree {
    interface Elements {
      PositionPoint: PositionPoint
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                 Position Point                                 */
/*                                                                                */
/**********************************************************************************/

const _inverseMatrix = /*@__PURE__*/ new THREE.Matrix4()
const _ray = /*@__PURE__*/ new THREE.Ray()
const _sphere = /*@__PURE__*/ new THREE.Sphere()
const _position = /*@__PURE__*/ new THREE.Vector3()

export class PositionPoint extends THREE.Group {
  size: number
  color: THREE.Color
  instance: THREE.Points | undefined
  instanceKey: Parameters<typeof T.PositionPoint> | undefined
  constructor() {
    super()
    this.size = 0
    this.color = new THREE.Color('white')
    this.instance = undefined
    this.instanceKey = undefined
  }

  // This will allow the virtual instance have bounds
  get geometry() {
    return this.instance?.geometry
  }

  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
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
      const intersectPoint = new THREE.Vector3()
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
  getParent: () => THREE.Points
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

interface PointsInstancesProps extends S3.Props<'Points'> {
  ref?: Ref<THREE.Points>
  range?: number
  limit?: number
}

const parentMatrix = /*@__PURE__*/ new THREE.Matrix4()
const position = /*@__PURE__*/ new THREE.Vector3()

/**
 * Instance implementation, relies on react + context to update the attributes based on the children of this component
 */
function PointsInstances(props: PointsInstancesProps) {
  const [config, rest] = processProps(props, { limit: 1000 }, ['ref', 'children', 'range', 'limit'])
  const [refs, setRefs] = createSignal<PositionPoint[]>([])
  const [positions, colors, sizes] = [
    new Float32Array(config.limit * 3),
    Float32Array.from({ length: config.limit * 3 }, () => 1),
    Float32Array.from({ length: config.limit }, () => 1),
  ]

  let parent: THREE.Points

  createEffect(() => {
    if (!parent.geometry.attributes.position) return
    parent.geometry.attributes.position.needsUpdate = true
  })

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

  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(parent)
    else config.ref = parent
  })

  return (
    <T.Points
      ref={parent!}
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
          usage={THREE.DynamicDrawUsage}
        />
        <T.BufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <T.BufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          usage={THREE.DynamicDrawUsage}
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
    </T.Points>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                     Point                                    */
/*                                                                                */
/**********************************************************************************/

interface PointProps extends S3.Props<'PositionPoint'> {
  ref?: Ref<unknown>
}

export function Point(props: PointProps) {
  extend({ PositionPoint })

  const [config, rest] = splitProps(props, ['ref', 'children'])

  let positionPoint: PositionPoint
  const pointContext = usePointContext()

  onMount(() => {
    pointContext.subscribe(positionPoint)
  })
  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(positionPoint)
    else config.ref = positionPoint
  })

  return (
    <T.PositionPoint instance={pointContext.getParent()} ref={positionPoint!} {...rest}>
      {config.children}
    </T.PositionPoint>
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
interface PointsBufferProps extends S3.Props<'Points'> {
  ref?: Ref<THREE.Points>
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

  let points: THREE.Points

  useFrame(() => {
    if (!points) return

    const attr = points.geometry.attributes
    if (!attr || !attr.position) return
    attr.position.needsUpdate = true

    if (config.colors && attr.color) attr.color.needsUpdate = true
    if (config.sizes && attr.size) attr.size.needsUpdate = true
  })

  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(points)
    else config.ref = points
  })

  return (
    <T.Points ref={points!} {...rest}>
      <T.BufferGeometry>
        <T.BufferAttribute
          attach="attributes-position"
          count={config.positions.length / config.stride}
          array={config.positions}
          itemSize={config.stride}
          usage={THREE.DynamicDrawUsage}
        />
        <Show when={config.colors}>
          <T.BufferAttribute
            attach="attributes-color"
            count={config.colors!.length / config.stride}
            array={config.colors}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </Show>
        <Show when={config.sizes}>
          <T.BufferAttribute
            attach="attributes-size"
            count={config.sizes!.length / config.stride}
            array={config.sizes}
            itemSize={1}
            usage={THREE.DynamicDrawUsage}
          />
        </Show>
      </T.BufferGeometry>
      {config.children}
    </T.Points>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                     Points                                     */
/*                                                                                */
/**********************************************************************************/

type PointsPropsBase = PointsBufferProps | PointsInstancesProps
type PointsProps = PointsPropsBase & { ref?: Ref<THREE.Points> }

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
