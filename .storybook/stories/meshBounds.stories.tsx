import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { meshBounds } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Misc/meshBounds',
  component: meshBounds,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'meshBounds',
      },
    },
  },
} satisfies Meta<typeof meshBounds>

export default meta
type Story = StoryObj<typeof meta>

function MeshBoundsDemo(props: { position: [number, number, number] }) {
  const [hovered, setHovered] = createSignal(false)
  const turntable = useTurntable()

  return (
    <T.Mesh
      position={props.position}
      raycast={meshBounds}
      ref={turntable}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <T.BoxGeometry />
      <T.MeshStandardMaterial color={hovered() ? 'hotpink' : 'orange'} wireframe={!hovered()} />
    </T.Mesh>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <MeshBoundsDemo position={[-2, 0, 0]} />
        <MeshBoundsDemo position={[0, 0, 0]} />
        <MeshBoundsDemo position={[2, 0, 0]} />
      </>
    )
  },
}
