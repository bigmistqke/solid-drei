import { Entity } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Color } from 'three'
import { useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/GLTF',
  component: useGLTF,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [0, 0, 5] }} lights={false}>
        <T.PointLight position={[1, 1, 2]} intensity={3} distance={20} />
        <T.PointLight position={[-1, 1, 2]} intensity={0.05} distance={20} />
        <T.AmbientLight intensity={0.25} />
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Use Gltf',
      },
    },
  },
} satisfies Meta<typeof useGLTF>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Use Gltf                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const suzanne = useGLTF(() => 'suzanne.glb')
    return (
      <Entity from={suzanne()?.scene}>
        <T.MeshPhongMaterial attach="children-0-material" color={new Color('blue')} />
      </Entity>
    )
  },
}

export const LocalBinaries: Story = {
  render() {
    const suzanne = useGLTF(() => 'suzanne.glb', { useDraco: true })
    return <Entity from={suzanne()?.scene} />
  },
}
