import { processProps } from '@/utils/process-props'
import type { JSX } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import { Group, Texture } from 'three'
import { type CubeCameraOptions, useCubeCamera } from './useCubeCamera'

type CameraPropsBase = Omit<S3.Props<Group>, 'children'> & CubeCameraOptions
interface CameraProps extends CameraPropsBase {
  /** The contents of CubeCamera will be hidden when filming the cube */
  children: (tex: Texture) => JSX.Element
  /** Number of frames to render, Infinity */
  frames?: number
}

export function CubeCamera(props: CameraProps) {
  const [config, rest] = processProps(
    props,
    {
      frames: Infinity,
    },
    ['children', 'frames', 'resolution', 'near', 'far', 'envMap', 'fog'],
  )
  const group = new Group()

  const { fbo, camera, update } = useCubeCamera({
    resolution: config.resolution,
    near: config.near,
    far: config.far,
    envMap: config.envMap,
    fog: config.fog,
  })

  let count = 0
  useFrame(() => {
    if (group && (config.frames === Infinity || count < config.frames)) {
      group.visible = false
      update()
      group.visible = true
      count++
    }
  })

  return (
    <Entity from={new Group()} {...rest}>
      <Entity from={camera()} />
      <Entity from={group}>{config.children(fbo().texture)}</Entity>
    </Entity>
  )
}
