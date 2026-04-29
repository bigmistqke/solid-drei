import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AsciiRenderer } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Misc/AsciiRenderer',
  component: AsciiRenderer,
  decorators: [
    Story => (
      <Setup lights={false} defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof AsciiRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return (
      <>
        <T.PointLight position={[10, 10, 10]} intensity={1.5} />
        <T.Mesh ref={useTurntable()}>
          <T.TorusGeometry args={[1, 0.4, 16, 100]} />
          <T.MeshStandardMaterial color="white" />
        </T.Mesh>
        <AsciiRenderer />
      </>
    )
  },
}
