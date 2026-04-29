import { processProps, useRef } from '@/utils'
import type { S3 } from 'solid-three'
import { QuadraticBezierCurve3, Vector3 } from 'three'
import { Line2 } from 'three-stdlib'
import type { LineProps } from './Line'
import { Line } from './Line'

const VECTOR = new Vector3()

interface QuadraticBezierLineRef extends Line2 {
  setPoints: (start: S3.Vector3, end: S3.Vector3, mid: S3.Vector3) => void
}
interface QuadraticBezierLineProps extends Omit<LineProps, 'points' | 'ref' | 'segments'> {
  ref?: QuadraticBezierLineRef | ((value: S3.Meta<QuadraticBezierLineRef>) => void)
  start?: S3.Vector3
  end?: S3.Vector3
  mid?: S3.Vector3
  segments?: number
}

export function QuadraticBezierLine(props: QuadraticBezierLineProps) {
  const [config, rest] = processProps(
    props,
    {
      end: [0, 0, 0],
      // mid: [0, 0, 0],
      segments: 20,
      start: [0, 0, 0],
    },
    ['ref', 'start', 'end', 'mid', 'segments'],
  )

  const curve = new QuadraticBezierCurve3(undefined as any, undefined as any, undefined as any)

  function getPoints({
    start,
    end,
    mid,
    segments = 20,
  }: {
    start: S3.Vector3
    end: S3.Vector3
    mid: S3.Vector3
    segments?: number
  }) {
    if (start instanceof Vector3) curve.v0.copy(start)
    else curve.v0.set(...(start as [number, number, number]))
    if (end instanceof Vector3) curve.v2.copy(end)
    else curve.v2.set(...(end as [number, number, number]))
    if (mid instanceof Vector3) {
      curve.v1.copy(mid)
    } else if (Array.isArray(mid)) {
      curve.v1.set(...(mid as [number, number, number]))
    } else {
      curve.v1.copy(
        curve.v0
          .clone()
          .add(curve.v2.clone().sub(curve.v0))
          .add(VECTOR.set(0, curve.v0.y - curve.v2.y, 0)),
      )
    }
    return curve.getPoints(segments)
  }

  return (
    <Line
      ref={line => {
        const quadraticLine = Object.assign(line, {
          setPoints(start: S3.Vector3, end: S3.Vector3, mid: S3.Vector3) {
            const points = getPoints({ start, end, mid })
            if (line.geometry) line.geometry.setPositions(points.map(p => p.toArray()).flat())
          },
        })
        useRef(props, quadraticLine as QuadraticBezierLineRef)
      }}
      points={getPoints({
        start: config.start,
        end: config.end,
        mid: config.mid as S3.Vector3,
        segments: config.segments,
      })}
      {...rest}
    />
  )
}
