import { CatmullRomLine, CubicBezierLine, Line, QuadraticBezierLine } from '@/index'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { GeometryUtils } from 'three-stdlib'
import { Setup } from '../Setup'

const meta = {
  title: 'Shapes/Line',
  component: Line,
  argTypes: {
    color: {
      control: 'color',
      segments: { control: { type: 'range', min: 1, max: 20, step: 1 } },
    },
  },
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 17] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Line',
      },
    },
  },
} satisfies Meta<typeof Line>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Line                                     */
/*                                                                                */
/**********************************************************************************/

const POINTS = GeometryUtils.hilbert3D(new Vector3(0), 5).map(p => [p.x, p.y, p.z]) as [
  number,
  number,
  number,
][]

const COLORS = new Array(POINTS.length)
  .fill(0)
  .map(() => [Math.random(), Math.random(), Math.random()]) as [number, number, number][]

const CAT_POINTS = [
  [0, 0, 0] as [number, number, number],
  [-8, 6, -5] as [number, number, number],
  [-2, 3, 7] as [number, number, number],
  [6, 4.5, 3] as [number, number, number],
  [0.5, 8, -1] as [number, number, number],
]

export const Basic: Story = {
  args: {
    color: 'red',
    lineWidth: 3,
    dashed: false,
  },
  render(props) {
    return <Line points={POINTS} {...props} />
  },
}

export const QuadraticBezier: Story = {
  args: {
    start: [0, 0, 0],
    end: [4, 7, 5],
    segments: 10,
    color: 'red',
    lineWidth: 2,
    dashed: false,
  },
  render(props) {
    return <QuadraticBezierLine {...props} />
  },
}

export const CubicBezier: Story = {
  args: {
    start: [0, 0, 0],
    end: [10, 0, 10],
    midA: [5, 4, 0],
    midB: [0, 0, 5],
    segments: 10,
    color: 'red',
    lineWidth: 2,
    dashed: false,
  },
  render(props) {
    return <CubicBezierLine {...props} />
  },
}

export const CatmullRom: Story = {
  args: {
    closed: false,
    curveType: 'centripetal',
    segments: 20,
    color: 'red',
    lineWidth: 3,
    dashed: false,
  },
  argTypes: {
    curveType: {
      control: 'radio',
      options: ['centripetal', 'chordal', 'catmullrom'],
    },
  },
  render(props) {
    return <CatmullRomLine points={CAT_POINTS} {...props} />
  },
}

export const VertexColors: Story = {
  args: {
    color: 'white',
    lineWidth: 3,
    dashed: false,
  },
  render(props) {
    return <Line points={POINTS} vertexColors={COLORS} {...props} />
  },
}
