import { createEffect } from 'solid-js'
import type { Ref } from 'solid-js'
import { T } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'
import { processProps } from '@/utils/process-props'

export interface ResizeProps extends S3.Props<'Group'> {
  ref?: Ref<THREE.Group>
  /** Whether to fit into width (x axis), undefined */
  width?: boolean
  /** Whether to fit into height (y axis), undefined */
  height?: boolean
  /** Whether to fit into depth (z axis), undefined */
  depth?: boolean
  /** You can optionally pass the Box3, otherwise will be computed, undefined */
  box3?: THREE.Box3
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

  let ref: THREE.Group = null!
  let outer: THREE.Group = null!
  let inner: THREE.Group = null!

  createEffect(() => {
    outer.matrixWorld.identity()
    let box = config.box3 || new THREE.Box3().setFromObject(inner, config.precise)
    const w = box.max.x - box.min.x
    const h = box.max.y - box.min.y
    const d = box.max.z - box.min.z

    let dimension = Math.max(w, h, d)
    if (config.width) dimension = w
    if (config.height) dimension = h
    if (config.depth) dimension = d

    outer.scale.setScalar(1 / dimension)
  }, [config.width, config.height, config.depth, config.box3, config.precise])

  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(ref)
    else config.ref = ref
  })

  return (
    <T.Group {...rest} ref={ref}>
      <T.Group ref={outer}>
        <T.Group ref={inner}>{config.children}</T.Group>
      </T.Group>
    </T.Group>
  )
}
