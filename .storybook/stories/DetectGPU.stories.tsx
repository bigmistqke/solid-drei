import { createEffect } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Text } from '../../src'
import { useDetectGPU } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/DetectGPU',
  component: useDetectGPU,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 20] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useDetectGPU>

export default meta
type Story = StoryObj<typeof meta>

function DetectGPUScene() {
  const gpu = useDetectGPU()
  return (
    <T.Group>
      <Text maxWidth={200}>
        {() => {
          const g = gpu()
          return g
            ? `| device ${g.device} fps ${g.fps} | gpu ${g.gpu} isMobile ${g.isMobile?.toString()} | Tier ${g.tier.toString()} Type ${g.type} |`
            : 'Detecting GPU...'
        }}
      </Text>
    </T.Group>
  )
}

export const Default: Story = {
  render() {
    return <DetectGPUScene />
  },
}
