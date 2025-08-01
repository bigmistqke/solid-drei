import { createEffect, type JSX, type Ref } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import { Group, MathUtils } from 'three'
import { processProps } from '../../utils/process-props'

export interface FloatProps extends Omit<S3.Props<'Group'>, 'children'> {
  ref?: Ref<Group>
  enabled?: boolean
  speed?: number
  rotationIntensity?: number
  floatIntensity?: number
  children: JSX.Element
  floatingRange?: [number?, number?]
}

export const Float = (props: FloatProps) => {
  const [config, rest] = processProps(
    props,
    {
      enabled: true,
      speed: 1,
      rotationIntensity: 1,
      floatIntensity: 1,
      floatingRange: [-0.1, 0.1],
    },
    ['ref', 'children', 'enabled', 'speed', 'rotationIntensity', 'floatIntensity', 'floatingRange'],
  )
  let group: Group

  let offset = Math.random() * 10000
  useFrame(state => {
    if (!config.enabled || config.speed === 0) return
    // TODO: implement state.clock
    const t = offset + state.clock.getElapsedTime()
    group.rotation.x = (Math.cos((t / 4) * config.speed) / 8) * config.rotationIntensity
    group.rotation.y = (Math.sin((t / 4) * config.speed) / 8) * config.rotationIntensity
    group.rotation.z = (Math.sin((t / 4) * config.speed) / 20) * config.rotationIntensity
    let yPosition = Math.sin((t / 4) * config.speed) / 10
    yPosition = MathUtils.mapLinear(
      yPosition,
      -0.1,
      0.1,
      config.floatingRange?.[0] ?? -0.1,
      config.floatingRange?.[1] ?? 0.1,
    )
    group.position.y = yPosition * config.floatIntensity
    group.updateMatrix()
  })

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(group)
    else props.ref = group
  })

  return (
    <T.Group {...rest}>
      <T.Group ref={group!} matrixAutoUpdate={false}>
        {config.children}
      </T.Group>
    </T.Group>
  )
}
