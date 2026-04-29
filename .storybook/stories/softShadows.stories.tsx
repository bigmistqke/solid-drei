import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { softShadows } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/softShadows',
  component: softShadows,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 8, 8] }}><Story /></Setup>)],
} satisfies Meta<typeof softShadows>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    softShadows({ size: 25, samples: 10, focus: 0 })

    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight castShadow position={[10, 10, 5]} shadow-mapSize={2048} />
        {/* Ground plane receiving shadows */}
        <T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <T.PlaneGeometry args={[10, 10]} />
          <T.MeshStandardMaterial color="white" />
        </T.Mesh>
        {/* Sphere casting shadow */}
        <T.Mesh castShadow position={[0, 2, 0]}>
          <T.SphereGeometry args={[1, 32, 32]} />
          <T.MeshStandardMaterial color="red" />
        </T.Mesh>
      </>
    )
  },
}
