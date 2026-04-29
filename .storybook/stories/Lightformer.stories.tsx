import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Lightformer, Sphere } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Lightformer',
  component: Lightformer,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 15] }}>
        <T.Color attach="background" args={['#0a0a0a']} />
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Lightformer>

export default meta
type Story = StoryObj<typeof meta>

function LightformerScene() {
  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <T.MeshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
      </Sphere>
      <Lightformer
        position={[5, 5, 5]}
        scale={[5, 5, 1]}
        form="rect"
        color="white"
        intensity={1}
        target={[0, 0, 0]}
      />
      <Lightformer
        position={[-5, 3, 5]}
        scale={[4, 4, 1]}
        form="circle"
        color="#ff6b9d"
        intensity={0.8}
        target={[0, 0, 0]}
      />
      <Lightformer
        position={[0, -5, 5]}
        scale={[6, 3, 1]}
        form="rect"
        color="#00d4ff"
        intensity={0.7}
        target={[0, 0, 0]}
      />
    </>
  )
}

export const Default: Story = {
  render() {
    return <LightformerScene />
  },
}
