import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Detailed, Icosahedron, OrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Abstractions/Detailed',
  component: Detailed,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: new Vector3(0, 0, 100) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Detailed>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <Detailed distances={[0, 50, 150]}>
          <Icosahedron args={[10, 3]}>
            <T.MeshBasicMaterial color="hotpink" wireframe />
          </Icosahedron>
          <Icosahedron args={[10, 2]}>
            <T.MeshBasicMaterial color="lightgreen" wireframe />
          </Icosahedron>
          <Icosahedron args={[10, 1]}>
            <T.MeshBasicMaterial color="lightblue" wireframe />
          </Icosahedron>
        </Detailed>
        <OrbitControls enablePan={false} enableRotate={false} zoomSpeed={0.5} />
      </>
    )
  },
}
