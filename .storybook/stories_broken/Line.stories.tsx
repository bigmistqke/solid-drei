import { CatmullRomLine, CubicBezierLine, Line, OrbitControls, QuadraticBezierLine } from '@/index'
import type { Decorator } from 'storybook-solidjs-vite/dist/renderer/public-types'
import { Vector3 } from 'three'
import { GeometryUtils } from 'three-stdlib'
import { Setup } from '../Setup'

export default {
  title: 'Shapes/Line',
  component: Line,
}

const points = GeometryUtils.hilbert3D(new Vector3(0), 5).map(p => [p.x, p.y, p.z]) as [
  number,
  number,
  number,
][]

const colors = new Array(points.length)
  .fill(0)
  .map(() => [Math.random(), Math.random(), Math.random()]) as [number, number, number][]

export function BasicLine() {
  return (
    <Line
      points={points}
      vertexColors={points.map(
        () => [Math.random(), Math.random(), Math.random(), Math.random()] as const,
      )}
      color={'red' /* color('color', 'red') */}
      lineWidth={3 /* number('lineWidth', 3) */}
      dashed={false /* boolean('dashed', false) */}
    />
  )
}
BasicLine.storyName = 'Basic'
BasicLine.decorators = [
  Story => {
    return (
      <Setup cameraPosition={new Vector3(0, 0, 17)}>
        <Story />
      </Setup>
    )
  },
] satisfies Decorator[]

export function QuadraticBezier() {
  return (
    <QuadraticBezierLine
      start={[0, 0, 0 /* number('startX', 0), number('startY', 0), number('startZ', 0) */]}
      end={[4, 7, 5 /* number('endX', 4), number('endY', 7), number('endZ', 5) */]}
      segments={10 /* number('segments', 10) */}
      color={'red' /* color('color', 'red') */}
      lineWidth={2 /* number('lineWidth', 2) */}
      dashed={true /* boolean('dashed', true) */}
    />
  )
}
QuadraticBezier.storyName = 'QuadraticBezier'
QuadraticBezier.decorators = [
  storyFn => (
    <Setup controls={false} cameraPosition={new Vector3(0, 0, 17)}>
      {storyFn()}
    </Setup>
  ),
] satisfies Decorator[]

export function CubicBezier() {
  return (
    <CubicBezierLine
      start={[0, 0, 0 /* number('startX', 0), number('startY', 0), number('startZ', 0) */]}
      end={[0, 0, 0 /* number('endX', 10), number('endY', 0), number('endZ', 10) */]}
      midA={[5, 4, 0 /* number('midAX', 5), number('midAY', 4), number('midAZ', 0) */]}
      midB={[0, 0, 5 /* number('midBX', 0), number('midBY', 0), number('midBZ', 5) */]}
      segments={10 /* number('segments', 10) */}
      color={'red' /* color('color', 'red') */}
      lineWidth={2 /* number('lineWidth', 2) */}
      dashed={true /* boolean('dashed', true) */}
    />
  )
}
CubicBezier.storyName = 'CubicBezier'
CubicBezier.decorators = [
  storyFn => <Setup cameraPosition={new Vector3(0, 0, 17)}>{storyFn()}</Setup>,
] satisfies Decorator[]

const catPoints = [
  [0, 0, 0] as [number, number, number],
  [-8, 6, -5] as [number, number, number],
  [-2, 3, 7] as [number, number, number],
  [6, 4.5, 3] as [number, number, number],
  [0.5, 8, -1] as [number, number, number],
]

export function CatmullRom() {
  return (
    <>
      <CatmullRomLine
        points={catPoints}
        closed={false /* boolean('closed', false) */}
        curveType={
          'centripetal' /* select('curveType', ['centripetal', 'chordal', 'catmullrom'], 'centripetal') */
        }
        tension={0.5 /* number('tension', 0.5, { range: true, min: 0, max: 1, step: 0.01 }) */}
        segments={20 /* number('segments', 20) */}
        color={'red' /* color('color', 'red') */}
        lineWidth={3 /* number('lineWidth', 3) */}
        dashed={true /* boolean('dashed', true) */}
      />
      <OrbitControls zoomSpeed={0.5} />
    </>
  )
}
CatmullRom.storyName = 'CatmullRom'
CatmullRom.decorators = [
  storyFn => (
    <Setup controls={false} cameraPosition={new Vector3(0, 0, 17)}>
      {storyFn()}
    </Setup>
  ),
] satisfies Decorator[]

export function VertexColorsLine() {
  return (
    <>
      <Line
        points={points}
        color={'white' /* color('color', 'white') */}
        vertexColors={colors}
        lineWidth={3 /* number('lineWidth', 3) */}
        dashed={false /* boolean('dashed', false) */}
      />
      <OrbitControls zoomSpeed={0.5} />
    </>
  )
}
VertexColorsLine.storyName = 'VertexColors'

VertexColorsLine.decorators = [
  storyFn => (
    <Setup controls={false} cameraPosition={new Vector3(0, 0, 17)}>
      {storyFn()}
    </Setup>
  ),
]
