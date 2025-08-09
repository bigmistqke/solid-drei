import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { createT } from 'solid-three'
import { DirectionalLight, MeshStandardMaterial, Vector3 } from 'three'
import { Box, Grid } from '../../src'
import { Setup } from '../Setup'

const T = createT({ MeshStandardMaterial, DirectionalLight })

const meta = {
  title: 'Gizmos/Grid',
  component: Grid,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(-5, 5, 10)}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'A customizable grid component for 3D scenes',
      },
    },
  },
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

function UseGridScene() {
  return (
    <>
      <Grid cellColor="white" args={[10, 10]} />
      <Box position={[0, 0.5, 0]}>
        <T.MeshStandardMaterial />
      </Box>
      <T.DirectionalLight position={[10, 10, 5]} />
    </>
  )
}

export const Default: Story = {
  render: () => <UseGridScene />,
  name: 'Default',
}
