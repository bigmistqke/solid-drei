import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { PresentationControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/PresentationControls',
  component: PresentationControls,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }} controls={false}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof PresentationControls>

export default meta
type Story = StoryObj<typeof meta>

function PresentationScene() {
  return (
    <PresentationControls
      global
      snap
      rotation={[0, -Math.PI / 4, 0]}
      polar={[-Math.PI / 4, Math.PI / 4]}
      azimuth={[-Math.PI / 4, Math.PI / 4]}
    >
      <T.Mesh>
        <T.BoxGeometry args={[2, 2, 2]} />
        <T.MeshStandardMaterial color="royalblue" />
      </T.Mesh>
    </PresentationControls>
  )
}

export const Default: Story = {
  render() {
    return <PresentationScene />
  },
}
