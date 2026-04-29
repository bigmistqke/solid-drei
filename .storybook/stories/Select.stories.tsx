import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Object3D } from 'three'
import { Select } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/Select',
  component: Select,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

function SelectScene() {
  const [selected, setSelected] = createSignal<Object3D[]>([])

  return (
    <Select multiple box onChange={setSelected}>
      <T.Mesh position={[-2, 0, 0]}>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>
      <T.Mesh position={[0, 0, 0]}>
        <T.SphereGeometry />
        <T.MeshStandardMaterial color="royalblue" />
      </T.Mesh>
      <T.Mesh position={[2, 0, 0]}>
        <T.BoxGeometry />
        <T.MeshStandardMaterial color="lightgreen" />
      </T.Mesh>
    </Select>
  )
}

export const Default: Story = {
  render() {
    return <SelectScene />
  },
}
