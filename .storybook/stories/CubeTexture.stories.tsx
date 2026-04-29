import type { Meta, StoryObj } from 'storybook-solidjs-vite'

import { Setup } from '../Setup'

import { CubeTexture, Icosahedron } from '../../src'
import { T } from '../t'

const meta = {
  title: 'Abstractions/CubeTexture',
  component: CubeTexture,
  decorators: [
    Story => (
      <Setup>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof meta>

export default meta
type Story = StoryObj<typeof meta>

function CubeTextureScene(props: any) {
  return (
    <Icosahedron args={[3, 4]}>
      <CubeTexture {...props}>
        {(texture: any) => <T.MeshStandardMaterial envMap={texture} roughness={0} metalness={0.9} color="#010101" />}
      </CubeTexture>
    </Icosahedron>
  )
}

export const Default: Story = {
  args: {
    files: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
    path: 'cube/',
  },
  render: (args) => <CubeTextureScene {...args} />,
}
