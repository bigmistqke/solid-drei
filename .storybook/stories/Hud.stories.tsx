import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Hud, OrthographicCamera } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/Hud',
  component: Hud,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Hud>

export default meta
type Story = StoryObj<typeof meta>

function HudScene() {
  return (
    <>
      <T.Mesh>
        <T.TorusKnotGeometry />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>
      <Hud renderPriority={1}>
        <OrthographicCamera makeDefault position={[0, 0, 100]} />
        <T.Mesh position={[-150, 100, 0]}>
          <T.BoxGeometry args={[40, 40, 40]} />
          <T.MeshStandardMaterial color="royalblue" />
        </T.Mesh>
        <T.AmbientLight />
      </Hud>
    </>
  )
}

export const Default: Story = {
  render() {
    return <HudScene />
  },
}
