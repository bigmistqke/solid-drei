import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Gltf, useGLTF } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Loaders/Gltf',
  component: Gltf,
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
        component: 'Gltf component and useGLTF hook',
      },
    },
  },
} satisfies Meta<typeof Gltf>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return <Gltf url="suzanne.glb" />
  },
}

export const LocalBinaries: Story = {
  render() {
    return <Gltf url="suzanne.glb" useDraco="/draco-gltf/" />
  },
}

export const UseGLTFHook: Story = {
  render() {
    const suzanne = useGLTF(() => 'suzanne.glb')
    return (
      <T.Entity from={suzanne()?.scene}>
        <T.MeshPhongMaterial color="blue" />
      </T.Entity>
    )
  },
}
