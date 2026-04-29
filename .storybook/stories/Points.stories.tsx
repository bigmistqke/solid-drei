import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Point, PointMaterial, Points } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/Points',
  component: Points,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 10] }}>
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Points',
      },
    },
  },
} satisfies Meta<typeof Points>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                              Points Buffer Story                               */
/*                                                                                */
/**********************************************************************************/

function PointsBufferScene() {
  const n = 1000
  const positions = new Float32Array(n * 3).map(() => (Math.random() - 0.5) * 10)

  return (
    <Points positions={positions}>
      <PointMaterial transparent vertexColors size={0.05} sizeAttenuation depthWrite={false} />
    </Points>
  )
}

export const Buffer: Story = {
  render() {
    return <PointsBufferScene />
  },
}

/**********************************************************************************/
/*                                                                                */
/*                            Points Instances Story                              */
/*                                                                                */
/**********************************************************************************/

function PointEvent(props: { position: [number, number, number]; color: string }) {
  const [hovered, setHovered] = createSignal(false)
  const [clicked, setClicked] = createSignal(false)
  return (
    <Point
      position={props.position}
      color={clicked() ? 'hotpink' : hovered() ? 'red' : props.color}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
      onClick={(e: any) => { e.stopPropagation(); setClicked(c => !c) }}
    />
  )
}

function PointsInstancesScene() {
  const points = Array.from({ length: 200 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ] as [number, number, number],
    color: `hsl(${(i / 200) * 360}, 80%, 60%)`,
  }))

  return (
    <Points limit={200}>
      <PointMaterial transparent size={0.3} sizeAttenuation depthWrite={false} vertexColors />
      <For each={points}>
        {point => <PointEvent position={point.position} color={point.color} />}
      </For>
    </Points>
  )
}

export const Instances: Story = {
  render() {
    return <PointsInstancesScene />
  },
}
