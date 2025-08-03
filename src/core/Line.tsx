import { Ref, createMemo, createRenderEffect, onCleanup } from 'solid-js'
import { S3, T, useThree } from 'solid-three'
import { Color, ColorRepresentation, Vector2, Vector3 } from 'three'
import {
  Line2,
  LineGeometry,
  LineMaterial,
  LineMaterialParameters,
  LineSegments2,
  LineSegmentsGeometry,
} from 'three-stdlib'
import { every, whenever } from '../utils/conditionals'
import { processProps } from '../utils/process-props'

type LinePropsBase = Omit<LineMaterialParameters, 'vertexColors' | 'color'> &
  Omit<S3.ClassProps<Line2>, 'args'> &
  Omit<S3.ClassProps<LineMaterial>, 'color' | 'vertexColors' | 'args'>

export interface LineProps extends LinePropsBase {
  ref?: Ref<LineSegments2 | Line2>
  points: Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
  vertexColors?: Array<Color | [number, number, number]>
  lineWidth?: number
  segments?: boolean
  color?: ColorRepresentation
}

export function Line(props: LineProps) {
  const [config, rest] = processProps(props, { color: 'black' }, [
    'ref',
    'points',
    'color',
    'vertexColors',
    'linewidth',
    'lineWidth',
    'segments',
    'dashed',
  ])
  const store = useThree()

  const line2 = createMemo<LineSegments2 | Line2>(() =>
    config.segments ? new LineSegments2() : new Line2(),
  )
  const lineMaterial = new LineMaterial()
  const lineGeometry = createMemo(() => {
    const geometry = config.segments ? new LineSegmentsGeometry() : new LineGeometry()

    const positions = config.points.map(p => {
      const isArray = Array.isArray(p)
      return p instanceof Vector3
        ? [p.x, p.y, p.z]
        : p instanceof Vector2
        ? [p.x, p.y, 0]
        : isArray && p.length === 3
        ? [p[0], p[1], p[2]]
        : isArray && p.length === 2
        ? [p[0], p[1], 0]
        : p
    })
    geometry.setPositions(positions.flat())

    if (config.vertexColors) {
      const colors = config.vertexColors.map(c => (c instanceof Color ? c.toArray() : c))
      geometry.setColors(colors.flat())
    }

    return geometry
  })

  createRenderEffect(whenever(every(line2, config.points), ([line]) => line.computeLineDistances()))

  createRenderEffect(() => {
    if (config.dashed) {
      lineMaterial.defines.USE_DASH = ''
    } else {
      // Setting lineMaterial.defines.USE_DASH to undefined is apparently not sufficient.
      delete lineMaterial.defines.USE_DASH
    }
    lineMaterial.needsUpdate = true
  })

  onCleanup(() => lineGeometry().dispose())

  const dpr = store.dpr ?? 1
  const lineWidth = dpr * (config.linewidth ?? config.lineWidth ?? 1)
  
  return (
    <>
      <T.Primitive object={line2()} ref={config.ref} {...rest}>
        <T.Primitive object={lineGeometry()} attach="geometry" />
        <T.Primitive
          object={lineMaterial}
          attach="material"
          color={config.color}
          vertexColors={Boolean(config.vertexColors)}
          resolution={[store.bounds.width, store.bounds.height]}
          linewidth={lineWidth}
          dashed={config.dashed}
          {...rest}
        />
      </T.Primitive>
    </>
  )
}
