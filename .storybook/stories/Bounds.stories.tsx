import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Bounds, OrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Bounds',
  component: Bounds,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Bounds',
      },
    },
  },
} satisfies Meta<typeof Bounds>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <Bounds fit clip observe margin={1.2}>
          <T.Mesh position={[-2, 0, 0]}>
            <T.BoxGeometry />
            <T.MeshStandardMaterial color="hotpink" />
          </T.Mesh>
          <T.Mesh position={[2, 0, 0]}>
            <T.BoxGeometry />
            <T.MeshStandardMaterial color="royalblue" />
          </T.Mesh>
        </Bounds>
        <OrbitControls makeDefault />
      </>
    )
  },
}
