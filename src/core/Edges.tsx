import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createEffect } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { EdgesGeometry, LineBasicMaterial, LineSegments, Mesh } from 'three'

interface EdgesProps extends S3.Props<LineSegments> {
  ref?: Ref<LineSegments>
  threshold?: number
  color?: S3.Color
}

export const Edges = (props: EdgesProps) => {
  const [config, rest] = processProps(props, { threshold: 15, color: 'black' }, [
    'ref',
    'userData',
    'children',
    'geometry',
    'threshold',
    'color',
  ])
  const lineSegments = new LineSegments()

  createEffect(() => {
    const parent = lineSegments.parent as Mesh
    if (parent) {
      const geom = config.geometry || parent.geometry
      if (
        geom !== lineSegments.userData.currentGeom ||
        config.threshold !== lineSegments.userData.currentThreshold
      ) {
        lineSegments.userData.currentGeom = geom
        lineSegments.userData.currentThreshold = config.threshold
        lineSegments.geometry = new EdgesGeometry(geom, config.threshold)
      }
    }
  })

  useRef(props, lineSegments)

  return (
    <Entity from={lineSegments} raycast={() => null} {...rest}>
      {config.children ? config.children : <Entity from={LineBasicMaterial} color={config.color} />}
    </Entity>
  )
}
