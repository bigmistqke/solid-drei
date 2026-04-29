import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { Box3, Group, Object3D, Sphere, Vector3 } from 'three'

export interface OnCenterCallbackProps {
  /** The next parent above <Center> */
  parent: Object3D
  /** The outmost container group of the <Center> component */
  container: Object3D
  width: number
  height: number
  depth: number
  boundingBox: Box3
  boundingSphere: Sphere
  center: Vector3
  verticalAlignment: number
  horizontalAlignment: number
  depthAlignment: number
}

export interface CenterProps extends S3.Props<Group> {
  ref?: Ref<Group>
  top?: boolean
  right?: boolean
  bottom?: boolean
  left?: boolean
  front?: boolean
  back?: boolean
  /** Disable all axes */
  disable?: boolean
  /** Disable x-axis centering */
  disableX?: boolean
  /** Disable y-axis centering */
  disableY?: boolean
  /** Disable z-axis centering */
  disableZ?: boolean
  /** See https://threejs.org/docs/index.html?q=box3#api/en/math/Box3.setFromObject */
  precise?: boolean
  /** Callback, fires in the useLayoutEffect phase, after measurement */
  onCentered?: (props: OnCenterCallbackProps) => void
  /** Optional cacheKey to keep the component from recalculating on every render */
  cacheKey?: any
}

export function Center(props: CenterProps) {
  const [config, rest] = processProps(
    props,
    {
      precise: true,
      cacheKey: 0,
    },
    [
      'ref',
      'children',
      'disable',
      'disableX',
      'disableY',
      'disableZ',
      'left',
      'right',
      'top',
      'bottom',
      'front',
      'back',
      'onCentered',
      'precise',
      'cacheKey',
    ],
  )

  const group = new Group()
  const outer = new Group()
  const inner = new Group()

  createEffect(
    () => [config.cacheKey, config.precise, config.disable, config.disableX, config.disableY, config.disableZ, config.top, config.bottom, config.left, config.right, config.front, config.back] as const,
    () => {
      outer.matrixWorld.identity()
      const box3 = new Box3().setFromObject(inner, config.precise)
      const center = new Vector3()
      const sphere = new Sphere()
      const width = box3.max.x - box3.min.x
      const height = box3.max.y - box3.min.y
      const depth = box3.max.z - box3.min.z
      box3.getCenter(center)
      box3.getBoundingSphere(sphere)
      const vAlign = config.top ? height / 2 : config.bottom ? -height / 2 : 0
      const hAlign = config.left ? -width / 2 : config.right ? width / 2 : 0
      const dAlign = config.front ? depth / 2 : config.back ? -depth / 2 : 0

      outer.position.set(
        config.disable || config.disableX ? 0 : -center.x + hAlign,
        config.disable || config.disableY ? 0 : -center.y + vAlign,
        config.disable || config.disableZ ? 0 : -center.z + dAlign,
      )

      // Only fire onCentered if the bounding box has changed
      if (typeof config.onCentered !== 'undefined') {
        config.onCentered({
          parent: group.parent!,
          container: group,
          width,
          height,
          depth,
          boundingBox: box3,
          boundingSphere: sphere,
          center: center,
          verticalAlignment: vAlign,
          horizontalAlignment: hAlign,
          depthAlignment: dAlign,
        })
      }
    },
  )

  useRef(config, group)

  return (
    <Entity from={group} {...rest}>
      <Entity from={outer}>
        <Entity from={inner}>{config.children}</Entity>
      </Entity>
    </Entity>
  )
}
