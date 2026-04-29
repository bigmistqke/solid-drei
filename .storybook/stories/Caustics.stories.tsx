import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Caustics, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Caustics',
  component: Caustics,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 5, 10] }}>
        <T.Color attach="background" args={['#1a1a1a']} />
        <T.AmbientLight intensity={0.5} />
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Caustics>

export default meta
type Story = StoryObj<typeof meta>

function CausticsScene() {
  return (
    <Caustics color="white" lightSource={[5, 5, 5]} frames={Infinity}>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <T.MeshPhongMaterial color="#4a90e2" />
      </Sphere>
    </Caustics>
  )
}

export const Default: Story = {
  render() {
    return <CausticsScene />
  },
}
