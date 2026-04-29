import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { ScreenSizer } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shapes/ScreenSizer',
  component: ScreenSizer,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof ScreenSizer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <ScreenSizer scale={100}>
        <T.Mesh>
          <T.PlaneGeometry />
          <T.MeshBasicMaterial color="orange" />
        </T.Mesh>
      </ScreenSizer>
    )
  },
}
