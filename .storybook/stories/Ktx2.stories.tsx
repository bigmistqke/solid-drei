import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Box, useKTX2 } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/Ktx2',
  component: useKTX2,
  decorators: [
    Story => (
      <Setup>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useKTX2>

export default meta
type Story = StoryObj<typeof meta>

function UseKTX2Scene(props: { input: string[] }) {
  const textures = useKTX2(props.input)

  return (
    <Suspense>
      <T.Group>
        <Box position={[-2, 0, 0]}>
          <T.MeshBasicMaterial map={() => textures()?.[0]} />
        </Box>
        <Box position={[2, 0, 0]}>
          <T.MeshBasicMaterial map={() => textures()?.[1]} />
        </Box>
      </T.Group>
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <UseKTX2Scene input={['sample_uastc_zstd.ktx2', 'sample_etc1s.ktx2']} />
  },
}
