import { createContext, createEffect, createSignal, onMount, useContext } from 'solid-js'
import type { Ref, JSX } from 'solid-js'
import { T, extend, useFrame } from 'solid-three'
import type { S3 } from 'solid-three'
import { Color, Vector2, Vector3 } from 'three'
import { Line2, LineMaterial, LineSegmentsGeometry } from 'three-stdlib'
import { processProps } from '@/utils/process-props'

declare global {
  namespace SolidThree {
    interface Elements {
      SegmentObject: SegmentObject
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                 Segment Object                                 */
/*                                                                                */
/**********************************************************************************/

export class SegmentObject {
  color: Color
  start: Vector3
  end: Vector3
  constructor() {
    this.color = new Color('white')
    this.start = new Vector3(0, 0, 0)
    this.end = new Vector3(0, 0, 0)
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                Segments Context                                */
/*                                                                                */
/**********************************************************************************/

interface SegmentsContext {
  subscribe: (ref: SegmentObject) => void
}
const segmentsContext = createContext<SegmentsContext>()
function useSegments() {
  const context = useContext(segmentsContext)
  if (!context) throw '<Segment/> should be a descendant of <Segments/>'
  return context
}

/**********************************************************************************/
/*                                                                                */
/*                                    Segments                                    */
/*                                                                                */
/**********************************************************************************/

interface SegmentsProps {
  ref?: Ref<Line2>
  limit?: number
  lineWidth?: number
  children: JSX.Element
}

export function Segments(props: SegmentsProps) {
  extend({ SegmentObject })

  const [config, rest] = processProps(
    props,
    {
      limit: 1000,
      lineWidth: 1.0,
    },
    ['ref', 'limit', 'lineWidth', 'children'],
  )

  const [segments, setSegments] = createSignal<Array<SegmentObject>>([])

  const line = new Line2()
  const material = new LineMaterial()
  const geometry = new LineSegmentsGeometry()
  const resolution = new Vector2(512, 512)
  const positions = Array(config.limit * 6).fill(0)
  const colors = Array(config.limit * 6).fill(0)

  useFrame(() => {
    const limit = Math.min(segments().length, config.limit)
    for (let i = 0; i < limit; i++) {
      const segment = segments()[i]!
      positions[i * 6 + 0] = segment.start.x
      positions[i * 6 + 1] = segment.start.y
      positions[i * 6 + 2] = segment.start.z

      positions[i * 6 + 3] = segment.end.x
      positions[i * 6 + 4] = segment.end.y
      positions[i * 6 + 5] = segment.end.z

      colors[i * 6 + 0] = segment.color.r
      colors[i * 6 + 1] = segment.color.g
      colors[i * 6 + 2] = segment.color.b

      colors[i * 6 + 3] = segment.color.r
      colors[i * 6 + 4] = segment.color.g
      colors[i * 6 + 5] = segment.color.b
    }
    geometry.setColors(colors)
    geometry.setPositions(positions)
    line.computeLineDistances()
  })

  return (
    <T.Primitive object={line} ref={config.ref}>
      <T.Primitive object={geometry} attach="geometry" />
      <T.Primitive
        object={material}
        attach="material"
        vertexColors={true}
        resolution={resolution}
        linewidth={config.lineWidth}
        {...rest}
      />
      <segmentsContext.Provider
        value={{
          subscribe(ref: SegmentObject) {
            setSegments(segments => [...segments, ref])
            return () => setSegments(segments => segments.filter(item => item !== ref))
          },
        }}
      >
        {config.children}
      </segmentsContext.Provider>
    </T.Primitive>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                     Segment                                    */
/*                                                                                */
/**********************************************************************************/

function normalizePosition(position: SegmentProps['start']): Vector3 {
  if (position instanceof Vector3) {
    return position
  }
  if (typeof position === 'number') {
    return new Vector3(position, position, position)
  }
  return new Vector3(...position)
}

interface SegmentProps extends Omit<S3.Props<'SegmentObject'>, 'start' | 'end' | 'color'> {
  ref?: Ref<SegmentObject>
  start: S3.Vector3
  end: S3.Vector3
  color?: S3.Color
}

export function Segment(props: SegmentProps) {
  const api = useSegments()
  let segmentObject: SegmentObject

  onMount(() => {
    api.subscribe(segmentObject)
  })

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(segmentObject)
    else props.ref = segmentObject
  })

  return (
    <T.SegmentObject
      ref={segmentObject!}
      color={props.color}
      start={normalizePosition(props.start)}
      end={normalizePosition(props.end)}
    />
  )
}
