import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Box, PivotControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Gizmos/PivotControls',
  component: PivotControls,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 2.5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof PivotControls>

export default meta
type Story = StoryObj<typeof meta>

function PivotScene() {
  return (
    <>
      <PivotControls depthTest={false} anchor={[-1, -1, -1]} scale={0.75}>
        <Box>
          <T.MeshStandardMaterial />
        </Box>
      </PivotControls>
      <T.DirectionalLight position={[10, 10, 5]} />
    </>
  )
}

export const Default: Story = {
  render() {
    return <PivotScene />
  },
}
