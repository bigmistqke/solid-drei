import { createSignal, type Accessor, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { type Mesh } from 'three'
import { Html, Sphere, Torus, useSurfaceSampler } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useSurfaceSampler',
  decorators: [
    (Story: () => JSX.Element) => (
      <Setup defaultCamera={{ position: [0, 0, 8] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                            Surface Sampler                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const [torusMesh, setTorusMesh] = createSignal<Mesh | undefined>()
    const [instanceMesh, setInstanceMesh] = createSignal<Mesh | undefined>()

    // Sample 64 points on the torus surface
    const sampleCount = 64
    const buffer = useSurfaceSampler(
      torusMesh as Accessor<Mesh | undefined>,
      sampleCount,
      ({ position }, i) => {
        // Transform callback is optional - points will be positioned at sampled locations
      },
      undefined,
      instanceMesh as Accessor<Mesh | undefined>,
    )

    return (
      <>
        {/* The torus surface to sample from (hidden) */}
        <Torus args={[2, 0.8, 16, 40]} ref={setTorusMesh} material-visible={false}>
          <T.MeshStandardMaterial />
        </Torus>

        {/* Visual representation of the torus (for reference) */}
        <Torus args={[2, 0.8, 16, 40]} rotation={[0.3, 0, 0.4]}>
          <T.MeshStandardMaterial color="#4dabf7" wireframe={false} opacity={0.3} transparent={true} />
        </Torus>

        {/* InstancedMesh displaying sampled points */}
        <T.InstancedMesh
          args={[undefined, undefined, sampleCount]}
          ref={el => {
            if (el) setInstanceMesh(el)
          }}
        >
          <T.SphereGeometry args={[0.1, 8, 8]} />
          <T.MeshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
        </T.InstancedMesh>

        {/* Instructions */}
        <Html
          position={[0, -3.5, 0]}
          center
          distanceFactor={1}
          style={{
            width: '300px',
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            'border-radius': '4px',
            'text-align': 'center',
            'font-family': 'system-ui',
            'font-size': '12px',
            'line-height': '1.5',
          }}
        >
          <div>Red spheres: {sampleCount} sampled points</div>
          <div style={{ 'font-size': '11px', 'margin-top': '6px', opacity: 0.8 }}>
            Points randomly distributed across the torus surface
          </div>
        </Html>
      </>
    )
  },
}

export const WithTransform: Story = {
  render() {
    const [torusMesh, setTorusMesh] = createSignal<Mesh | undefined>()
    const [instanceMesh, setInstanceMesh] = createSignal<Mesh | undefined>()

    const sampleCount = 48
    const buffer = useSurfaceSampler(
      torusMesh as Accessor<Mesh | undefined>,
      sampleCount,
      ({ position, normal, dummy }) => {
        // Position at sampled point
        dummy.position.copy(position)

        // Scale based on normal direction for visual effect
        dummy.scale.set(0.08, 0.08, 0.08)
      },
      undefined,
      instanceMesh as Accessor<Mesh | undefined>,
    )

    return (
      <>
        {/* The torus surface to sample from (hidden) */}
        <Torus args={[2, 0.8, 16, 40]} ref={setTorusMesh} material-visible={false}>
          <T.MeshStandardMaterial />
        </Torus>

        {/* Visual torus with rotation animation */}
        <T.Group rotation={[0.3, 0, 0.4]}>
          <Torus args={[2, 0.8, 16, 40]}>
            <T.MeshStandardMaterial color="#a78bfa" wireframe={false} opacity={0.2} transparent={true} />
          </Torus>
        </T.Group>

        {/* InstancedMesh with custom transform */}
        <T.InstancedMesh
          args={[undefined, undefined, sampleCount]}
          ref={el => {
            if (el) setInstanceMesh(el)
          }}
        >
          <T.OctahedronGeometry args={[1, 0]} />
          <T.MeshStandardMaterial color="#ffd43b" emissive="#ffd43b" emissiveIntensity={0.4} />
        </T.InstancedMesh>

        {/* Instructions */}
        <Html
          position={[0, -3.5, 0]}
          center
          distanceFactor={1}
          style={{
            width: '300px',
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            'border-radius': '4px',
            'text-align': 'center',
            'font-family': 'system-ui',
            'font-size': '12px',
            'line-height': '1.5',
          }}
        >
          <div>Octahedrons: {sampleCount} points with transform</div>
          <div style={{ 'font-size': '11px', 'margin-top': '6px', opacity: 0.8 }}>
            Transform callback scales points uniformly
          </div>
        </Html>
      </>
    )
  },
}
