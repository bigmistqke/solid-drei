import { every, when } from '@/utils/conditionals'
import { processProps } from '@/utils/process-props'
import type { Ref } from 'solid-js'
import { createEffect, createMemo, createRenderEffect, onCleanup } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import type { ColorRepresentation } from 'three'
import { Color, Vector2, Vector3, Vector4 } from 'three'
import type { LineMaterialParameters } from 'three-stdlib'
import {
  Line2,
  LineGeometry,
  LineMaterial,
  LineSegments2,
  LineSegmentsGeometry,
} from 'three-stdlib'

type LinePropsBase = Omit<LineMaterialParameters, 'vertexColors' | 'color'> &
  Omit<S3.Props<Line2>, 'args'> &
  Omit<S3.Props<LineMaterial>, 'color' | 'vertexColors' | 'args'>

export interface LineProps extends LinePropsBase {
  ref?: Ref<LineSegments2 | Line2>
  points: ReadonlyArray<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
  vertexColors?: ReadonlyArray<Color | [number, number, number] | [number, number, number, number]>
  lineWidth?: number
  segments?: boolean
  color?: ColorRepresentation
}

export function Line(props: LineProps) {
  const [config, rest] = processProps(props, { color: 0xffffff }, [
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
  const itemSize = (config.vertexColors?.[0] as number[] | undefined)?.length
  const lineGeometry = createMemo(() => {
    const geometry = config.segments ? new LineSegmentsGeometry() : new LineGeometry()
    let localColor = config.color

    const positions = config.points.map(point => {
      return point instanceof Vector3 || point instanceof Vector4
        ? point.toArray()
        : point instanceof Vector2
        ? [point.x, point.y, 0]
        : Array.isArray(point)
        ? point.length === 3
          ? [point[0], point[1], point[2]]
          : [point[0], point[1], 0]
        : point
    })
    geometry.setPositions(positions.flat())

    if (config.vertexColors) {
      // using vertexColors requires the color value to be white see #1813
      localColor = 0xffffff
      const colors = config.vertexColors.map(c => (c instanceof Color ? c.toArray() : c))
      geometry.setColors(colors.flat(), itemSize)
    }

    return { geometry, color: localColor }
  })

  createEffect(when(every(line2, config.points), ([line]) => line.computeLineDistances()))

  createRenderEffect(() => {
    if (config.dashed) {
      lineMaterial.defines.USE_DASH = ''
    } else {
      // Setting lineMaterial.defines.USE_DASH to undefined is apparently not sufficient.
      delete lineMaterial.defines.USE_DASH
    }
    lineMaterial.needsUpdate = true
  })

  onCleanup(() => {
    lineGeometry().geometry.dispose()
    lineMaterial.dispose()
  })

  return (
    <Entity from={line2()} ref={config.ref}>
      <Entity from={lineGeometry().geometry} attach="geometry" />
      <Entity
        from={lineMaterial}
        attach="material"
        color={lineGeometry().color}
        vertexColors={Boolean(config.vertexColors)}
        resolution={[store.bounds.width, store.bounds.height]}
        linewidth={config.linewidth ?? config.lineWidth ?? 1}
        dashed={config.dashed}
        transparent={itemSize === 4}
        {...rest}
      />
    </Entity>
  )
}
