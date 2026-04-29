import { For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Merged } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Performance/Merged',
  component: Merged,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 15, 20] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Merged>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Merged Meshes Story                                 */
/*                                                                                */
/**********************************************************************************/

function MergedScene() {
  const mesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 'hotpink' }),
  )

  const mesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ color: 'cyan' }),
  )

  const positions = Array.from({ length: 25 }, (_, i) => {
    const row = Math.floor(i / 5)
    const col = i % 5
    return [col * 1.5 - 3, row * 1.5 - 3, 0] as [number, number, number]
  })

  return (
    <Merged meshes={[mesh1, mesh2]} limit={100}>
      {(BoxInstance, SphereInstance) => (
        <For each={positions}>
          {(pos, idx) => {
            const isBox = idx() % 2 === 0
            if (isBox) {
              return <BoxInstance position={pos} />
            } else {
              return <SphereInstance position={pos} />
            }
          }}
        </For>
      )}
    </Merged>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 8, 5]} intensity={1} />
        <MergedScene />
      </>
    )
  },
}
