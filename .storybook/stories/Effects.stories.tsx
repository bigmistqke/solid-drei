import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Effects, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Effects',
  component: Effects,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <T.Color attach="background" args={['#1a1a2e']} />
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[10, 10, 5]} intensity={1} />
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Effects>

export default meta
type Story = StoryObj<typeof meta>

function EffectsScene() {
  return (
    <>
      <Effects multisamping={8} disableGamma={false}>
        <Sphere args={[1.5, 32, 32]}>
          <T.MeshStandardMaterial color="#ff6b6b" metalness={0.5} roughness={0.3} />
        </Sphere>
      </Effects>
      <Sphere args={[1.5, 32, 32]}>
        <T.MeshStandardMaterial color="#ff6b6b" metalness={0.5} roughness={0.3} />
      </Sphere>
    </>
  )
}

export const Default: Story = {
  render() {
    return <EffectsScene />
  },
}
