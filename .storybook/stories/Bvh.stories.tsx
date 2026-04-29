import { createSignal, createEffect, ComponentProps } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { MeshBVHHelper } from 'three-mesh-bvh'
import { Setup, T } from '../Setup'
import { useHelper, Bvh, OrbitControls } from '../../src'
import { Group, Mesh, Raycaster, Vector3 } from 'three'

const pointDist = 5
const raycaster = new Raycaster()
const origVec = new Vector3()
const dirVec = new Vector3()

const meta = {
  title: 'Performance/Bvh',
  component: Bvh,
  args: {
    enabled: true,
  },
  decorators: [
    Story => (
      <Setup controls={false}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Bvh>

export default meta
type Story = StoryObj<typeof meta>

function TorusBVH({ z = 0, ...props }: { z: number } & ComponentProps<'group'>) {
  let mesh: THREE.Mesh = null!

  useHelper(mesh, MeshBVHHelper)

  const [hovered, setHover] = createSignal(false)
  return (
    <Bvh {...props}>
      <T.TorusKnot
        ref={mesh}
        position-z={z}
        args={[1, 0.4, 250, 50]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshBasicMaterial color={hovered() ? 0xffff00 : 0xff0000} />
      </T.TorusKnot>
    </Bvh>
  )
}

const AddRaycaster = ({ grp }: { grp: { current: THREE.Group } }) => {
  let objRef: Group = null!
  let origMesh: Mesh = null!
  let hitMesh: Mesh = null!
  let cylinderMesh: Mesh = null!

  createEffect(() => {
    if (!objRef || !origMesh || !hitMesh || !cylinderMesh) return
    hitMesh.scale.multiplyScalar(0.5)
    origMesh.position.set(pointDist, 0, 0)
    objRef.rotation.x = Math.random() * 10
    objRef.rotation.y = Math.random() * 10
  })

  const xDir = Math.random() - 0.5
  const yDir = Math.random() - 0.5

  useFrame((_, delta) => {
    const obj = objRef
    if (!obj || !origMesh || !hitMesh || !cylinderMesh) return
    obj.rotation.x += xDir * delta
    obj.rotation.y += yDir * delta

    origMesh.updateMatrixWorld()
    origVec.setFromMatrixPosition(origMesh.matrixWorld)
    dirVec.copy(origVec).multiplyScalar(-1).normalize()

    raycaster.set(origVec, dirVec)
    const ray: any = raycaster
    ray.firstHitOnly = true
    const res = raycaster.intersectObject(grp.current, true)
    const length = res.length ? res[0].distance : pointDist

    hitMesh.position.set(pointDist - length, 0, 0)
    cylinderMesh.position.set(pointDist - length / 2, 0, 0)
    cylinderMesh.scale.set(1, length, 1)
    cylinderMesh.rotation.z = Math.PI / 2
  })

  return (
    <group ref={objRef}>
      <mesh ref={origMesh}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      <mesh ref={hitMesh}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      <mesh ref={cylinderMesh}>
        <cylinderGeometry args={[0.01, 0.01]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

const DebugRayCast = ({ grp }: { grp: { current: THREE.Group } }) => {
  return (
    <>
      {new Array(40).fill({}).map((_, id) => (
        <AddRaycaster key={id} grp={grp} />
      ))}
    </>
  )
}

function Scene(props: ComponentProps<typeof Bvh>) {
  let grp: THREE.Group = null!

  const { raycaster } = useThree()
  raycaster.firstHitOnly = true

  return (
    <>
      <group ref={grp}>
        <TorusBVH {...props} z={-2} />
        <TorusBVH {...props} z={0} />
        <TorusBVH {...props} z={2} />
      </group>
      <DebugRayCast grp={grp} />
      <OrbitControls enablePan={false} zoomSpeed={0.5} />
    </>
  )
}

export const Default: Story = {
  render(props) {
    return <Scene {...props} />
  },
  name: 'Default',
}
