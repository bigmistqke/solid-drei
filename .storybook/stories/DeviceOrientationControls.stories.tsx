import { Meta, StoryObj } from 'storybook-solidjs-vite'

import { Setup, T } from '../Setup'

import { DeviceOrientationControls, Box } from '../../src'

const meta = {
  title: 'Controls/DeviceOrientationControls',
  component: DeviceOrientationControls,
  decorators: [
    (Story) => (
      <Setup camera={{ near: 1, far: 1100, fov: 75 }} controls={false}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof DeviceOrientationControls>

export default meta
type Story = StoryObj<typeof meta>

function DeviceOrientationControlsScene(props: any) {
  return (
    <>
      <DeviceOrientationControls {...props} />

      <Box args={[100, 100, 100, 4, 4, 4]}>
        <T.MeshBasicMaterial wireframe />
        <axesHelper args={[100]} />
      </Box>
    </>
  )
}

export const Default: Story = {
  name: 'Default',
  render: (args) => <DeviceOrientationControlsScene {...args} />,
}
