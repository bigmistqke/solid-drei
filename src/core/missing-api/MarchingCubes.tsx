import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createContext, createMemo, useContext } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import * as THREE from 'three'
import { Color, Group } from 'three'
import { MarchingCubes as MarchingCubesImpl } from 'three-stdlib'

type Api = {
  getParent: () => MarchingCubesImpl
}

const globalContext = createContext<Api>(null!)
const GlobalContext = globalContext

export interface MarchingCubesProps extends S3.Props<Group> {
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
      <Entity from={marchingCubes()} {...rest} ref={marchingCubesRef}>
        <GlobalContext value={{ getParent: () => marchingCubesRef }}>
          {props.children}
        </GlobalContext>
      </Entity>
    </>
  )
}

interface MarchingCubeProps extends S3.Props<Group> {
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
  // let cubeRef: Group
  const cube = new Group()

  useFrame(() => {
    const parent = context?.getParent()
    if (!parent) return
    cube.getWorldPosition(vector)
    parent.addBall(
      0.5 + vector.x * 0.5,
      0.5 + vector.y * 0.5,
      0.5 + vector.z * 0.5,
      props.strength,
      props.subtract,
      props.color,
    )
  })

  useRef(props, cube)

  return <Entity from={cube} {...rest} />
}

interface MarchingPlaneProps extends S3.Props<Group> {
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
  const group = new Group()

  const planeType = createMemo(() =>
    props.planeType === 'x' ? 'addPlaneX' : props.planeType === 'y' ? 'addPlaneY' : 'addPlaneZ',
  )

  useFrame(() => {
    if (!context?.getParent() || !group) return
    context.getParent()![planeType()](props.strength, props.subtract)
  })

  useRef(props, group)

  return <Entity from={group} {...rest} />
}
