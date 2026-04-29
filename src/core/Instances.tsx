import { processProps } from '@/utils'
import {
  type Context,
  type JSX,
  createContext,
  createSignal,
  onMount,
  onCleanup,
  omit,
  useContext,
} from 'solid-js'
import { Entity, createT, useFrame, type S3 } from 'solid-three'
import { Group, InstancedMesh, DynamicDrawUsage } from 'three'
import * as THREE from 'three'

// PositionMesh: a virtual Group that carries per-instance position/color
// and delegates raycasting back to the parent InstancedMesh.
const _instanceLocalMatrix = new THREE.Matrix4()
const _instanceWorldMatrix = new THREE.Matrix4()
const _instanceIntersects: THREE.Intersection[] = []
const _mesh = new THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>()

class PositionMesh extends THREE.Group {
  color: THREE.Color
  instance: THREE.InstancedMesh | undefined
  instanceKey: PositionMesh | undefined

  constructor() {
    super()
    this.color = new THREE.Color('white')
  }

  get geometry() {
    return this.instance?.geometry
  }

  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
    const parent = this.instance
    if (!parent?.geometry || !parent.material) return
    _mesh.geometry = parent.geometry
    const matrixWorld = parent.matrixWorld
    const instanceId = parent.userData.instances?.indexOf(this)
    if (instanceId === -1 || instanceId === undefined || instanceId > parent.count) return
    parent.getMatrixAt(instanceId, _instanceLocalMatrix)
    _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix)
    _mesh.matrixWorld = _instanceWorldMatrix
    if (parent.material instanceof THREE.Material) _mesh.material.side = parent.material.side
    else _mesh.material.side = (parent.material as THREE.Material[])[0].side
    _mesh.raycast(raycaster, _instanceIntersects)
    for (let i = 0; i < _instanceIntersects.length; i++) {
      const intersect = _instanceIntersects[i]
      intersect.instanceId = instanceId
      intersect.object = this
      intersects.push(intersect)
    }
    _instanceIntersects.length = 0
  }
}

const T = createT({ PositionMesh })

type Api = {
  getParent: () => THREE.InstancedMesh
  subscribe: (ref: PositionMesh) => () => void
}

export type InstanceProps = S3.Props<typeof PositionMesh> & {
  context?: Context<Api | undefined>
}

export type InstancesProps = Omit<S3.Props<typeof InstancedMesh>, 'children'> & {
  range?: number
  limit?: number
  frames?: number
  children?: JSX.Element | ((instance: (props: InstanceProps) => JSX.Element) => JSX.Element)
}

const globalContext = createContext<Api>(null!)
const parentMatrix = new THREE.Matrix4()
const instanceMatrix = new THREE.Matrix4()
const tempMatrix = new THREE.Matrix4()
const translation = new THREE.Vector3()
const rotation = new THREE.Quaternion()
const scale = new THREE.Vector3()

export function Instance(_props: InstanceProps) {
  const rest = omit(_props, 'context', 'ref', 'children')
  const { subscribe, getParent } = useContext(_props.context || globalContext)!

  let positionMesh: PositionMesh = null!

  onMount(() => {
    onCleanup(subscribe(positionMesh))
  })

  return (
    <T.PositionMesh
      ref={v => {
        positionMesh = v
        v.instanceKey = v
        if (typeof _props.ref === 'function') _props.ref(v as any)
        else if (_props.ref !== undefined) (_props as any).ref = v
      }}
      instance={getParent()}
      {...(rest as any)}
    >
      {_props.children}
    </T.PositionMesh>
  )
}

export function Instances(_props: InstancesProps) {
  const [props, rest] = processProps(
    _props,
    { limit: 1000, frames: Infinity },
    ['ref', 'children', 'range', 'limit', 'frames'],
  )

  const { context, instance } = (() => {
    const ctx = createContext<Api>(null!)
    return {
      context: ctx,
      instance: (p: InstanceProps) => <Instance context={ctx} {...p} />,
    }
  })()

  let parentRef: THREE.InstancedMesh = null!
  const instances: PositionMesh[] = []
  const [, setCount] = createSignal(0)

  const matrices = (() => {
    const arr = new Float32Array(props.limit * 16)
    for (let i = 0; i < props.limit; i++) tempMatrix.identity().toArray(arr, i * 16)
    return arr
  })()
  const colors = new Float32Array(props.limit * 3).fill(1)

  let count = 0
  useFrame(() => {
    if (props.frames === Infinity || count < props.frames) {
      parentRef.updateMatrix()
      parentRef.updateMatrixWorld()
      parentMatrix.copy(parentRef.matrixWorld).invert()

      const updateRange = Math.min(props.limit, props.range ?? props.limit, instances.length)
      parentRef.count = updateRange
      parentRef.instanceMatrix.updateRange.count = updateRange * 16
      parentRef.instanceColor!.updateRange.count = updateRange * 3

      for (let i = 0; i < instances.length; i++) {
        const inst = instances[i]
        inst.matrixWorld.decompose(translation, rotation, scale)
        instanceMatrix.compose(translation, rotation, scale).premultiply(parentMatrix)
        instanceMatrix.toArray(matrices, i * 16)
        parentRef.instanceMatrix.needsUpdate = true
        inst.color.toArray(colors, i * 3)
        parentRef.instanceColor!.needsUpdate = true
      }
      count++
    }
  })

  const api: Api = {
    getParent: () => parentRef,
    subscribe: (ref: PositionMesh) => {
      instances.push(ref)
      setCount(c => c + 1)
      return () => {
        const i = instances.indexOf(ref)
        if (i !== -1) instances.splice(i, 1)
        setCount(c => c - 1)
      }
    },
  }

  return (
    <Entity
      from={InstancedMesh}
      ref={(v: THREE.InstancedMesh) => {
        parentRef = v
        v.userData.instances = instances
        if (typeof _props.ref === 'function') _props.ref(v as any)
        else if (_props.ref !== undefined) (_props as any).ref = v
      }}
      matrixAutoUpdate={false}
      args={[null as any, null as any, 0]}
      raycast={() => null}
      {...(rest as any)}
    >
      <Entity
        from={THREE.InstancedBufferAttribute}
        attach="instanceMatrix"
        count={matrices.length / 16}
        array={matrices}
        itemSize={16}
        usage={DynamicDrawUsage}
      />
      <Entity
        from={THREE.InstancedBufferAttribute}
        attach="instanceColor"
        count={colors.length / 3}
        array={colors}
        itemSize={3}
        usage={DynamicDrawUsage}
      />
      {typeof props.children === 'function' ? (
        <context.Provider value={api}>{props.children(instance)}</context.Provider>
      ) : (
        <globalContext.Provider value={api}>{props.children}</globalContext.Provider>
      )}
    </Entity>
  )
}
