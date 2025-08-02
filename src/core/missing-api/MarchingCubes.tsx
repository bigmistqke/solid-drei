import { Ref, createContext, createEffect, createMemo, useContext } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import * as THREE from 'three'
import { Color, Group } from 'three'
import { MarchingCubes as MarchingCubesImpl } from 'three-stdlib'
import { processProps } from '../../utils/process-props.ts'

type Api = {
  getParent: () => MarchingCubesImpl
}

const globalContext = createContext<Api>(null!)

export interface MarchingCubesProps extends S3.Props<'Group'> {
  resolution?: number
  maxPolyCount?: number
  enableUvs?: boolean
  enableColors?: boolean
}

export function MarchingCubes(_props: MarchingCubesProps) {
  const [props, rest] = processProps(
    _props,
    {
      resolution: 28,
      maxPolyCount: 10000,
      enableUvs: false,
      enableColors: false,
    },
    ['resolution', 'maxPolyCount', 'enableUvs', 'enableColors', 'children'],
  )

  let marchingCubesRef: MarchingCubesImpl = null!
  const marchingCubes = createMemo(
    () =>
      new MarchingCubesImpl(
        props.resolution,
        null as unknown as THREE.Material,
        props.enableUvs,
        props.enableColors,
        props.maxPolyCount,
      ),
  )

  useFrame(() => {
    marchingCubes().update()
    marchingCubes().reset()
  }, -1) // To make sure the reset runs before the balls or planes are added

  return (
    <>
      <T.Primitive object={marchingCubes()} {...rest} ref={marchingCubesRef}>
        <globalContext.Provider value={{ getParent: () => marchingCubesRef }}>
          {props.children}
        </globalContext.Provider>
      </T.Primitive>
    </>
  )
}

interface MarchingCubeProps extends S3.Props<'Group'> {
  ref?: Ref<Group>
  strength?: number
  subtract?: number
  color?: Color
}

export const MarchingCube = (_props: MarchingCubeProps) => {
  const [props, rest] = processProps(
    _props,
    {
      strength: 0.5,
      subtract: 12,
    },
    ['ref', 'strength', 'subtract', 'color'],
  )

  const context = useContext(globalContext)
  const vector = new THREE.Vector3()
  let cubeRef: Group

  useFrame(() => {
    const parent = context?.getParent()
    if (!parent) return
    cubeRef.getWorldPosition(vector)
    parent.addBall(
      0.5 + vector.x * 0.5,
      0.5 + vector.y * 0.5,
      0.5 + vector.z * 0.5,
      props.strength,
      props.subtract,
      props.color,
    )
  })
  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(cubeRef)
    else props.ref = cubeRef
  })
  return <T.Group ref={cubeRef} {...rest} />
}

interface MarchingPlaneProps extends S3.Props<'Group'> {
  ref?: Ref<Group>
  planeType?: 'x' | 'y' | 'z'
  strength?: number
  subtract?: number
}

export function MarchingPlane(_props: MarchingPlaneProps) {
  const [props, rest] = processProps(
    _props,
    {
      planeType: 'x',
      strength: 0.5,
      subtract: 12,
    },
    ['ref', 'planeType', 'strength', 'subtract'],
  )

  const context = useContext(globalContext)

  let wallRef: Group

  const planeType = createMemo(() =>
    props.planeType === 'x' ? 'addPlaneX' : props.planeType === 'y' ? 'addPlaneY' : 'addPlaneZ',
  )

  useFrame(() => {
    if (!context?.getParent() || !wallRef) return
    context.getParent()![planeType()](props.strength, props.subtract)
  })

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(wallRef)
    else props.ref = wallRef
  })

  return <T.Group ref={wallRef} {...rest} />
}
