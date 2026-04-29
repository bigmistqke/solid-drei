import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Outlines } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Abstractions/Outlines',
  component: Outlines,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Outlines>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    const turntable = useTurntable()

    return (
      <T.Group ref={turntable}>
        <T.Mesh>
          <T.BoxGeometry />
          <T.MeshStandardMaterial color="white" />
          <Outlines thickness={0.05} color="black" />
        </T.Mesh>
      </T.Group>
    )
  },
}
