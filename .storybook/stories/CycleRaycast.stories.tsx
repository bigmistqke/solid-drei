import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { CycleRaycast } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/CycleRaycast',
  component: CycleRaycast,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'CycleRaycast — cycle through overlapping objects with Tab or scroll wheel.',
      },
    },
  },
} satisfies Meta<typeof CycleRaycast>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                          CycleRaycast Overlapping Meshes                       */
/*                                                                                */
/**********************************************************************************/

function CycleScene() {
  const [hits, setHits] = createSignal<THREE.Intersection[]>([])
  const [cycleIndex, setCycleIndex] = createSignal(0)

  const onChanged = (intersections: THREE.Intersection[], cycle: number) => {
    setHits(intersections)
    setCycleIndex(cycle)
  }

  const isActive = (index: number) => cycleIndex() === index && hits().length > 0

  return (
    <>
      <CycleRaycast onChanged={onChanged} />
      <T.Mesh position={[-0.3, 0, 0]}>
        <T.BoxGeometry args={[1.5, 1.5, 0.1]} />
        <T.MeshStandardMaterial color={isActive(0) ? 'hotpink' : '#e06c75'} transparent opacity={0.85} />
      </T.Mesh>
      <T.Mesh position={[0, 0, -0.3]}>
        <T.BoxGeometry args={[1.5, 1.5, 0.1]} />
        <T.MeshStandardMaterial color={isActive(1) ? 'hotpink' : '#61afef'} transparent opacity={0.85} />
      </T.Mesh>
      <T.Mesh position={[0.3, 0, -0.6]}>
        <T.BoxGeometry args={[1.5, 1.5, 0.1]} />
        <T.MeshStandardMaterial color={isActive(2) ? 'hotpink' : '#98c379'} transparent opacity={0.85} />
      </T.Mesh>
      <T.AmbientLight intensity={0.5} />
      <T.DirectionalLight position={[5, 5, 5]} />
    </>
  )
}

export const Default: Story = {
  render() {
    return <CycleScene />
  },
}
