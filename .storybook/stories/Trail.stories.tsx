import { createSignal } from 'solid-js'
import { Entity, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Group, InstancedMesh, Mesh, Object3D, Vector3 } from 'three'
import { Float, PerspectiveCamera, Sphere, Trail, useTrail } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/Trail',
  component: Trail,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: new Vector3(0, 0, 5) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Trail>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Trail                                     */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const group = new Group()
    let sphere: Mesh = null!

    useFrame(({ clock }) => {
      const t = clock.getElapsedTime()
      if (!group || !sphere) return
      group.rotation.z = t
      sphere.position.x = Math.sin(t * 2) * 2
      sphere.position.z = Math.cos(t * 2) * 2
    })

    return (
      <>
        <Entity from={group!}>
          <Trail
            width={1}
            length={4}
            color={'#F8D628'}
            attenuation={(t: number) => {
              return t * t
            }}
          >
            <Sphere ref={sphere!} args={[0.1, 32, 32]} position-y={3}>
              <T.MeshNormalMaterial />
            </Sphere>
          </Trail>
        </Entity>

        <PerspectiveCamera makeCurrent position={[5, 5, 5]} />
        <T.AxesHelper />
      </>
    )
  },
}

export const UseTrailWithInstances: Story = {
  render() {
    const [sphere, setSphere] = createSignal<Mesh>(null!)

    const instancedMesh = new InstancedMesh(undefined, undefined, 1_000)

    useFrame(({ clock }) => {
      const t = clock.getElapsedTime()

      sphere().position.x = Math.sin(t) * 3 + Math.cos(t * 2)
      sphere().position.y = Math.cos(t) * 3
    })

    const trailPositions = useTrail(sphere, { length: 5, decay: 5, interval: 6 })
    const n = 1000

    const o = new Object3D()
    function updateInstances() {
      for (let i = 0; i < n; i += 1) {
        const x = trailPositions()?.slice(i * 3, i * 3 + 3)
        // @ts-ignore
        o.position.set(...x)

        o.scale.setScalar((i * 10) / n)
        o.updateMatrixWorld()

        instancedMesh.setMatrixAt(i, o.matrixWorld)
      }

      instancedMesh.count = n
      instancedMesh.instanceMatrix.needsUpdate = true
    }

    useFrame(updateInstances)

    return (
      <>
        <Sphere ref={setSphere} args={[0.1, 32, 32]} position-x={0} position-y={3}>
          <T.MeshNormalMaterial />
        </Sphere>

        <Entity from={instancedMesh}>
          <T.BoxGeometry args={[0.1, 0.1, 0.1]} />
          <T.MeshNormalMaterial />
        </Entity>
      </>
    )
  },
}

export const UseTrailWithRefTarget: Story = {
  render() {
    let [ref, setRef] = createSignal<Group>()
    return (
      <>
        <Float speed={5} floatIntensity={10} ref={setRef}>
          <Sphere args={[0.1, 32, 32]} position-x={0}>
            <T.MeshNormalMaterial />
          </Sphere>
        </Float>
        <Trail
          target={ref()}
          width={1}
          length={4}
          color={'#F8D628'}
          attenuation={(t: number) => {
            return t * t
          }}
        />
      </>
    )
  },
}
