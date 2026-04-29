import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import { LOD } from 'three'

interface DetailedProps extends S3.Props<LOD> {
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
    ['ref', 'children', 'hysteresis', 'distances', 'args'],
  )

  const lod = new LOD()

  createEffect(
    () => [config.hysteresis, config.distances] as const,
    () => {
      lod.levels.length = 0
      lod.children.forEach((object, index) =>
        lod.levels.push({
          object,
          hysteresis: config.hysteresis,
          distance: config.distances[index]!,
        }),
      )
    },
  )

  useFrame(state => lod.update(state.camera))

  useRef(props, lod)

  return (
    <Entity from={lod} ref={lod!} {...rest}>
      {config.children}
    </Entity>
  )
}
