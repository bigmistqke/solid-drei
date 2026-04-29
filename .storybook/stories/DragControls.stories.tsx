import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DragControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/DragControls',
  component: DragControls,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 8] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof DragControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Draggable Boxes Story                               */
/*                                                                                */
/**********************************************************************************/

function DraggableBoxesScene() {
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null)

  const colors = ['red', 'green', 'blue']
  const positions = [
    [-3, 0, 0],
    [0, 0, 0],
    [3, 0, 0],
  ] as [number, number, number][]

  return (
    <DragControls enabled={true}>
      {positions.map((pos, idx) => (
        <T.Mesh position={pos}>
          <T.BoxGeometry args={[1, 1, 1]} />
          <T.MeshStandardMaterial
            color={hoveredIndex() === idx ? 'orange' : colors[idx]}
            toneMapped={false}
          />
        </T.Mesh>
      ))}
    </DragControls>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} intensity={1} />
        <DraggableBoxesScene />
      </>
    )
  },
}
