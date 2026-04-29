import { processProps } from '@/utils'
import type { Intersect } from '@/utils/types'
import type { Ref } from 'solid-js'
import { createEffect, createMemo, createRenderEffect, onSettled } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, Entity, useThree } from 'solid-three'
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

export interface LineProps
  extends Intersect<
    [
      Omit<LineMaterialParameters, 'vertexColors' | 'color'>,
      Omit<S3.Props<Line2>, 'args' | 'ref'>,
      Omit<S3.Props<LineMaterial>, 'color' | 'vertexColors' | 'args' | 'ref'>,
    ]
  > {
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
  const itemSize = (config.vertexColors?.[0] as number[] | undefined)?.length as 3 | 4 | undefined
  const lineGeometry = createMemo(() => {
    const geometry = autodispose(config.segments ? new LineSegmentsGeometry() : new LineGeometry())
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

  createEffect(
    () => [line2(), lineGeometry()] as const,
    ([line]) => { line.computeLineDistances() },
  )

  createRenderEffect(
    () => config.dashed,
    dashed => {
      if (dashed) {
        lineMaterial.defines.USE_DASH = ''
      } else {
        // Setting lineMaterial.defines.USE_DASH to undefined is apparently not sufficient.
        delete lineMaterial.defines.USE_DASH
      }
      lineMaterial.needsUpdate = true
    },
  )

  onSettled(() => () => {
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
