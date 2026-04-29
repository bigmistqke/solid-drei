import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AccumulativeShadows, RandomizedLight, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/RandomizedLight',
  component: RandomizedLight,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 5, 10] }}>
        <T.Color attach="background" args={['#ffffff']} />
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof RandomizedLight>

export default meta
type Story = StoryObj<typeof meta>

function RandomizedLightScene() {
  return (
    <AccumulativeShadows
      frames={Infinity}
      color="black"
      colorBlend={2}
      opacity={1}
      scale={10}
      alphaTest={0.75}
    >
      <RandomizedLight
        amount={4}
        radius={4}
        ambient={0.5}
        intensity={1}
        position={[0, 5, 5]}
        castShadow
      />
      <Sphere args={[2, 32, 32]} position={[0, 2, 0]} castShadow>
        <T.MeshStandardMaterial color="#4a90e2" />
      </Sphere>
    </AccumulativeShadows>
  )
}

export const Default: Story = {
  render() {
    return <RandomizedLightScene />
  },
}
