import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { useFont } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/useFont',
  component: useFont,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useFont>

export default meta
type Story = StoryObj<typeof meta>

const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'

export const Default: Story = {
  render() {
    const font = useFont(() => fontUrl)
    return (
      <Suspense>
        <T.Text font={() => font()} fontSize={2} color="white">
          Hello from Solid Drei!
        </T.Text>
      </Suspense>
    )
  },
}

export const CustomText: Story = {
  render() {
    const font = useFont(() => fontUrl)
    return (
      <Suspense>
        <T.Text font={() => font()} fontSize={1.5} color="orange" anchorX="center" anchorY="middle">
          The quick brown fox jumps over the lazy dog
        </T.Text>
      </Suspense>
    )
  },
}
