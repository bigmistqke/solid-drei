import { Ref, createEffect } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import { LOD } from 'three'
import { processProps } from '../utils/process-props'

interface DetailedProps extends S3.Props<'LOD'> {
  ref?: Ref<LOD>
  hysteresis?: number
  distances: number[]
}

export function Detailed(props: DetailedProps) {
  const [config, rest] = processProps(
    props,
    {
      hysteresis: 0,
    },
    ['ref', 'children', 'hysteresis', 'distances'],
  )

  let lod: LOD

  createEffect(() => {
    lod.levels.length = 0
    lod.children.forEach((object, index) =>
      lod.levels.push({
        object,
        hysteresis: config.hysteresis,
        distance: config.distances[index]!,
      }),
    )
  })

  useFrame(state => lod.update(state.camera))

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(lod)
    else props.ref = lod
  })

  return (
    <T.LOD ref={lod!} {...rest}>
      {config.children}
    </T.LOD>
  )
}
