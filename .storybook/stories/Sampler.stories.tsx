import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { Sampler, TransformFn, ComputedAttribute } from '../../src'
import { BufferAttribute, InstancedMesh, Mesh } from 'three'

const meta = {
  title: 'Misc/Sampler',
  component: Sampler,
  args: {
    count: 500,
  },
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Sampler>

export default meta
type Story = StoryObj<typeof meta>

function SamplerScene(props: any) {
  return (
    <>
      <Sampler {...props}>
        <mesh>
          <torusKnotGeometry />
          <meshNormalMaterial />
        </mesh>

        <instancedMesh args={[null!, null!, 1_000]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshNormalMaterial />
        </instancedMesh>
      </Sampler>
    </>
  )
}

export const Default: Story = {
  render: (args) => <SamplerScene {...args} />,
  name: 'Default',
}

function RefAPIScene(props: any) {
  let meshRef: Mesh = null!
  let instancesRef: InstancedMesh = null!

  return (
    <>
      <Sampler {...props} mesh={meshRef} instances={instancesRef} />

      <mesh ref={meshRef}>
        <torusKnotGeometry />
        <meshNormalMaterial />
      </mesh>

      <instancedMesh ref={instancesRef} args={[null!, null!, 1_000]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshNormalMaterial />
      </instancedMesh>
    </>
  )
}

export const UsingRefs: Story = {
  render: (args) => <RefAPIScene {...args} />,
  name: 'Using Refs',
}

function TransformSamplerScene(props: any) {
  return (
    <>
      <Sampler {...props} transform={transformInstances}>
        <mesh>
          <torusKnotGeometry />
          <meshNormalMaterial />
        </mesh>

        <instancedMesh args={[null!, null!, 1_000]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshNormalMaterial />
        </instancedMesh>
      </Sampler>
    </>
  )
}

export const WithTransform: Story = {
  render: (args) => <TransformSamplerScene {...args} />,
  name: 'With transform',
}

function remap(x: number, [low1, high1]: number[], [low2, high2]: number[]) {
  return low2 + ((x - low1) * (high2 - low2)) / (high1 - low1)
}

const computeUpness = (geometry: any) => {
  const { array, count } = geometry.attributes.normal
  const arr = Float32Array.from({ length: count })

  const normalVector = new Vector3()
  const up = new Vector3(0, 1, 0)

  for (let i = 0; i < count; i++) {
    const n = array.slice(i * 3, i * 3 + 3)
    normalVector.set(n[0], n[1], n[2])

    const dot = normalVector.dot(up)
    const value = dot > 0.4 ? remap(dot, [0.4, 1], [0, 1]) : 0
    arr[i] = Number(value)
  }

  return new BufferAttribute(arr, 1)
}

function SamplerWeightScene(props: any) {
  return (
    <>
      <Sampler {...props}>
        <T.Mesh>
          <T.TorusKnotGeometry>
            <ComputedAttribute name="upness" compute={computeUpness} />
          </T.TorusKnotGeometry>
          <T.MeshNormalMaterial />
        </T.Mesh>

        <T.InstancedMesh args={[null!, null!, 1_000]}>
          <T.SphereGeometry args={[0.1, 32, 32, Math.PI / 2]} />
          <T.MeshNormalMaterial />
        </T.InstancedMesh>
      </Sampler>
    </>
  )
}

const transformInstances: TransformFn = ({ dummy, position }) => {
  dummy.position.copy(position)
  dummy.scale.setScalar(Math.random() * 0.75)
}

export const WithWeight: Story = {
  args: {
    weight: 'upness',
    transform: transformInstances,
  },
  render: (args) => <SamplerWeightScene {...args} />,
  name: 'With weight',
}
