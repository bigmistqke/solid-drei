import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Preload } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/Preload',
  component: Preload,
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
        component: 'Preload',
      },
    },
  },
} satisfies Meta<typeof Preload>

export default meta
type Story = StoryObj<typeof meta>

function PreloadScene() {
  return (
    <Suspense fallback={null}>
      <Preload all />
      <T.Mesh>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>
    </Suspense>
  )
}

export const Default: Story = {
  render() {
    return <PreloadScene />
  },
}
