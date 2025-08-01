import { Ref, createEffect } from 'solid-js'
import { S3, T } from 'solid-three'
import { EdgesGeometry, LineSegments, Mesh } from 'three'
import { processProps } from '../utils/process-props'

interface EdgesProps extends S3.Props<'LineSegments'> {
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
  let lineSegments: LineSegments = null!

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

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(lineSegments)
    else props.ref = lineSegments
  })

  return (
    <T.LineSegments ref={lineSegments} raycast={() => null} {...rest}>
      {config.children ? config.children : <T.LineBasicMaterial color={config.color} />}
    </T.LineSegments>
  )
}
