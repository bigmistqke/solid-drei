import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Edges } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Abstractions/Edges',
  component: Edges,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(3, 3, 3) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Edges>

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
          <Edges threshold={15} color="black" />
        </T.Mesh>
      </T.Group>
    )
  },
}
