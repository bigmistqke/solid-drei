import { processProps } from '@/utils'
import { createMemo } from 'solid-js'
import { CatmullRomCurve3, Color, Vector3 } from 'three'
import { Line2 } from 'three-stdlib'
import type { LineProps } from './Line'
import { Line } from './Line'

interface Props extends Omit<LineProps, 'ref' | 'segments'> {
  ref?: Line2
  closed?: boolean
  curveType?: 'centripetal' | 'chordal' | 'catmullrom'
  tension?: number
  segments?: number
}

export function CatmullRomLine(props: Props) {
  const [config, rest] = processProps(
    props,
    {
      closed: false,
      curveType: 'centripetal',
      tension: 0.5,
      segments: 20,
    },
    ['ref', 'points', 'closed', 'curveType', 'tension', 'segments', 'vertexColors'],
  )

  const curve = createMemo(() => {
    const mappedPoints = config.points.map(pt =>
      pt instanceof Vector3 ? pt : new Vector3(...(pt as [number, number, number])),
    )
    return new CatmullRomCurve3(mappedPoints, config.closed, config.curveType, config.tension)
  })

  const segmentedPoints = createMemo(() => curve().getPoints(config.segments))

  const interpolatedVertexColors = createMemo(() => {
    if (!config.vertexColors || config.vertexColors.length < 2) return undefined

    if (config.vertexColors.length === config.segments + 1) return config.vertexColors

    const mappedColors = config.vertexColors.map(color =>
      color instanceof Color ? color : new Color(...(color as [number, number, number])),
    )
    if (config.closed) mappedColors.push(mappedColors[0]!.clone())

    const iColors: Color[] = [mappedColors[0]!]
    const divisions = config.segments / (mappedColors.length - 1)
    for (let i = 1; i < config.segments; i++) {
      const alpha = (i % divisions) / divisions
      const colorIndex = Math.floor(i / divisions)
      iColors.push(mappedColors[colorIndex]!.clone().lerp(mappedColors[colorIndex + 1]!, alpha))
    }
    iColors.push(mappedColors[mappedColors.length - 1]!)

    return iColors
  })

  return (
    <Line
      ref={config.ref}
      points={segmentedPoints()}
      vertexColors={interpolatedVertexColors()}
      {...rest}
    />
  )
}
