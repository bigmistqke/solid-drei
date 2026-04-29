import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ShadowAlpha } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/ShadowAlpha',
  component: ShadowAlpha,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 5, 8] }}><Story /></Setup>)],
} satisfies Meta<typeof ShadowAlpha>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight castShadow position={[5, 10, 5]} shadow-mapSize={2048} />
        {/* Ground plane receiving shadow */}
        <T.Mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <T.PlaneGeometry args={[10, 10]} />
          <T.MeshStandardMaterial color="white" />
        </T.Mesh>
        {/* Invisible plane casting shadow */}
        <T.Mesh castShadow position={[0, 2, 0]}>
          <T.PlaneGeometry args={[2, 2]} />
          <ShadowAlpha opacity={1} />
        </T.Mesh>
      </>
    )
  },
}
