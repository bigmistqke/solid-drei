/**
 * ScreenSizer — scales its children so that 1 unit = 1 pixel on screen,
 * regardless of camera distance. Useful for UI elements that should maintain
 * consistent pixel size.
 *
 * Based on drei's ScreenSizer implementation.
 */
import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame, useThree } from 'solid-three'
import { Group, PerspectiveCamera, Vector3 } from 'three'

export interface ScreenSizerProps extends S3.Props<Group> {
  ref?: Ref<Group>
  /** Scale factor, default 1 */
  scale?: number
}

export function ScreenSizer(_props: ScreenSizerProps) {
  const [config, rest] = processProps(_props, { scale: 1 }, ['ref', 'children', 'scale'])

  const store = useThree()
  const group = new Group()
  const _worldPos = new Vector3()

  useRef(config, group)

  useFrame(({ camera }) => {
    const viewport = store.viewport
    const bounds = store.bounds

    let scaleFactor: number

    if (camera instanceof PerspectiveCamera) {
      // World-space distance from the camera to this group
      const distance = group.getWorldPosition(_worldPos).distanceTo(camera.position)
      const fovRad = (camera.fov * Math.PI) / 180
      // How many world units tall the viewport is at this distance
      const worldHeight = 2 * Math.tan(fovRad / 2) * distance
      // Scale so 1 unit = 1 pixel
      scaleFactor = worldHeight / bounds.height
    } else {
      // Orthographic: viewport already in world units, bounds in pixels
      scaleFactor = viewport.height / bounds.height
    }

    scaleFactor *= config.scale
    group.scale.setScalar(scaleFactor)
  })

  return (
    <Entity from={group} {...rest}>
      {config.children}
    </Entity>
  )
}
