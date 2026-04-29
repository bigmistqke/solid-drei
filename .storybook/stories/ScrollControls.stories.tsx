import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ScrollControls, useScrollContext } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/ScrollControls',
  component: ScrollControls,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof ScrollControls>

export default meta
type Story = StoryObj<typeof meta>

function ScrollScene() {
  const scroll = useScrollContext()

  return (
    <T.Mesh position-z={scroll.offset * -10}>
      <T.BoxGeometry />
      <T.MeshStandardMaterial color="hotpink" />
    </T.Mesh>
  )
}

function ScrollControlsStory() {
  return (
    <ScrollControls pages={3} damping={0.1}>
      <ScrollScene />
    </ScrollControls>
  )
}

export const Default: Story = {
  render() {
    return <ScrollControlsStory />
  },
}
