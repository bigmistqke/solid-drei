import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Instance, Instances } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/Instances',
  component: Instances,
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
        component: 'Instances',
      },
    },
  },
} satisfies Meta<typeof Instances>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Basic Instances Story                               */
/*                                                                                */
/**********************************************************************************/

function InstancesScene() {
  const positions = Array.from({ length: 100 }, () => [
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
  ] as [number, number, number])

  return (
    <Instances limit={100}>
      <T.BoxGeometry args={[0.2, 0.2, 0.2]} />
      <T.MeshStandardMaterial color="hotpink" />
      <For each={positions}>
        {pos => <Instance position={pos} />}
      </For>
    </Instances>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} />
        <InstancesScene />
      </>
    )
  },
}

/**********************************************************************************/
/*                                                                                */
/*                          Hoverable Instances Story                             */
/*                                                                                */
/**********************************************************************************/

function HoverInstance(props: { position: [number, number, number] }) {
  const [hovered, setHovered] = createSignal(false)
  return (
    <Instance
      position={props.position}
      color={hovered() ? 'orange' : 'white'}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    />
  )
}

function HoverInstancesScene() {
  const positions = Array.from({ length: 50 }, () => [
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 8,
  ] as [number, number, number])

  return (
    <Instances limit={50}>
      <T.SphereGeometry args={[0.15, 16, 16]} />
      <T.MeshStandardMaterial />
      <For each={positions}>
        {pos => <HoverInstance position={pos} />}
      </For>
    </Instances>
  )
}

export const Hoverable: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} />
        <HoverInstancesScene />
      </>
    )
  },
}
