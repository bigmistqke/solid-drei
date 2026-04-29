import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { useCursor } from '../../src'

const meta = {
  title: 'Misc/useCursor',
  component: useCursor,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useCursor>

export default meta
type Story = StoryObj<typeof meta>

function UseCursorScene() {
  const [hovered, setHovered] = createSignal(false)
  useCursor(hovered)

  return (
    <mesh
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={hovered() ? 'hotpink' : 'indianred'} />
    </mesh>
  )
}

export const Default: Story = {
  render() {
    return <UseCursorScene />
  },
  name: 'Default',
}
