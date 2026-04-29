import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { PointMaterial } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/PointMaterial',
  component: PointMaterial,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 0, 8] }}><Story /></Setup>)],
} satisfies Meta<typeof PointMaterial>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    const n = 500
    const positions = new Float32Array(n * 3)
    for (let i = 0; i < n * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 6
    }

    return (
      <>
        <T.AmbientLight intensity={0.8} />
        <T.DirectionalLight castShadow position={[0, 10, 5]} />
        <T.Points>
          <T.BufferGeometry>
            <T.BufferAttribute attach="attributes-position" args={[positions, 3]} />
          </T.BufferGeometry>
          <PointMaterial size={0.05} transparent sizeAttenuation depthWrite={false} />
        </T.Points>
      </>
    )
  },
}
