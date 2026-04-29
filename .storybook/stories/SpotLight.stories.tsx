import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { SpotLight } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/SpotLight',
  component: SpotLight,
  decorators: [
    Story => (
      <Setup lights={false} shadows defaultCamera={{ position: [0, 3, 7] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof SpotLight>

export default meta
type Story = StoryObj<typeof meta>

function SpotLightScene() {
  return (
    <>
      <SpotLight position={[3, 2, 0]} color="#ff005b" penumbra={0.5} intensity={0.5} />
      <SpotLight position={[-3, 2, 0]} color="#0EEC82" penumbra={0.5} intensity={0.5} />
      <T.Mesh position-y={0.5} castShadow>
        <T.BoxGeometry />
        <T.MeshPhongMaterial />
      </T.Mesh>
      <T.Mesh rotation-x={-Math.PI / 2} receiveShadow>
        <T.PlaneGeometry args={[100, 100]} />
        <T.MeshPhongMaterial />
      </T.Mesh>
    </>
  )
}

export const Default: Story = {
  render() {
    return <SpotLightScene />
  },
}
