import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshDiscardMaterial } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MeshDiscardMaterial',
  component: MeshDiscardMaterial,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 0, 5] }}><Story /></Setup>)],
} satisfies Meta<typeof MeshDiscardMaterial>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.8} />
        <T.DirectionalLight castShadow position={[0, 10, 5]} />
        {/* Invisible sphere with MeshDiscardMaterial */}
        <T.Mesh position={[-2, 0, 0]}>
          <T.SphereGeometry args={[1, 32, 32]} />
          <MeshDiscardMaterial />
        </T.Mesh>
        {/* Visible box for comparison */}
        <T.Mesh position={[2, 0, 0]}>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshPhongMaterial color="cyan" />
        </T.Mesh>
      </>
    )
  },
}
