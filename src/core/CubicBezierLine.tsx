import { createMemo } from 'solid-js'
import { CubicBezierCurve3, Vector3 } from 'three'
import { Line2 } from 'three-stdlib'
import { processProps } from '../utils/process-props.ts'
import { Line, LineProps } from './Line.tsx'

interface Props extends Omit<LineProps, 'points' | 'ref' | 'segments'> {
  ref: Line2
  start: Vector3 | [number, number, number]
  end: Vector3 | [number, number, number]
  midA: Vector3 | [number, number, number]
  midB: Vector3 | [number, number, number]
  segments?: number
}

export const CubicBezierLine = function CubicBezierLine(props: Props) {
  const [config, rest] = processProps(props, { segments: 20 }, [
    'ref',
    'start',
    'end',
    'midA',
    'midB',
    'segments',
  ])

  const points = createMemo(() => {
    const startV = config.start instanceof Vector3 ? config.start : new Vector3(...config.start)
    const endV = config.end instanceof Vector3 ? config.end : new Vector3(...config.end)
    const midAV = config.midA instanceof Vector3 ? config.midA : new Vector3(...config.midA)
    const midBV = config.midB instanceof Vector3 ? config.midB : new Vector3(...config.midB)
    const interpolatedV = new CubicBezierCurve3(startV, midAV, midBV, endV).getPoints(
      config.segments,
    )
    return interpolatedV
  })

  return <Line ref={config.ref as any} points={points()} {...rest} />
}
