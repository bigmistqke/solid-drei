import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MultiMaterial } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MultiMaterial',
  component: MultiMaterial,
  decorators: [Story => (<Setup defaultCamera={{ position: [0, 0, 5] }}><Story /></Setup>)],
} satisfies Meta<typeof MultiMaterial>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.8} />
        <T.DirectionalLight castShadow position={[5, 10, 5]} />
        {/* Box with MultiMaterial wrapper and multiple materials for different groups */}
        <MultiMaterial>
          <T.Mesh>
            <T.BoxGeometry args={[2, 2, 2]} />
            <T.MeshPhongMaterial color="red" />
            <T.MeshPhongMaterial color="blue" />
          </T.Mesh>
        </MultiMaterial>
      </>
    )
  },
}
