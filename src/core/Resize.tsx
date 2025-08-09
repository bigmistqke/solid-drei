import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createEffect } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { Box3, Group } from 'three'

export interface ResizeProps extends S3.Props<typeof Group> {
  ref?: Ref<Group>
  /** Whether to fit into width (x axis), undefined */
  width?: boolean
  /** Whether to fit into height (y axis), undefined */
  height?: boolean
  /** Whether to fit into depth (z axis), undefined */
  depth?: boolean
  /** You can optionally pass the Box3, otherwise will be computed, undefined */
  box3?: Box3
  /** See https://threejs.org/docs/index.html?q=box3#api/en/math/Box3.setFromObject */
  precise?: boolean
}

export function Resize(props: ResizeProps) {
  const [config, rest] = processProps(
    props,
    {
      precise: true,
    },
    ['ref', 'children', 'width', 'height', 'depth', 'box3', 'precise'],
  )

  const ref = new Group()
  const outer = new Group()
  const inner = new Group()

  createEffect(() => {
    outer.matrixWorld.identity()
    let box = config.box3 || new Box3().setFromObject(inner, config.precise)
    const w = box.max.x - box.min.x
    const h = box.max.y - box.min.y
    const d = box.max.z - box.min.z

    let dimension = Math.max(w, h, d)
    if (config.width) dimension = w
    if (config.height) dimension = h
    if (config.depth) dimension = d

    outer.scale.setScalar(1 / dimension)
  }, [config.width, config.height, config.depth, config.box3, config.precise])

  useRef(config, ref)

  return (
    <Entity from={ref} {...rest}>
      <Entity from={outer}>
        <Entity from={inner}>{config.children}</Entity>
      </Entity>
    </Entity>
  )
}
