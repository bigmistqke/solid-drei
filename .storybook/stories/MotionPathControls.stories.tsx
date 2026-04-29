import { createMemo } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { CatmullRomLine, MotionPathControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Controls/MotionPathControls',
  component: MotionPathControls,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 5, 8] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof MotionPathControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                        Sphere Along Path Story                                 */
/*                                                                                */
/**********************************************************************************/

function MotionPathScene() {
  const pathPoints = [
    new THREE.Vector3(-5, 0, -5),
    new THREE.Vector3(-5, 0, 5),
    new THREE.Vector3(5, 0, 5),
    new THREE.Vector3(5, 0, -5),
  ]

  const curve = createMemo(() => new THREE.CatmullRomCurve3(pathPoints, true, 'centripetal'))

  let sphereRef: THREE.Mesh | undefined

  return (
    <>
      <T.Mesh ref={(el) => { sphereRef = el }} position={pathPoints[0]}>
        <T.SphereGeometry args={[0.5, 32, 32]} />
        <T.MeshStandardMaterial color="hotpink" />
      </T.Mesh>

      <MotionPathControls
        object={sphereRef}
        curves={[curve()]}
        speed={0.3}
        loop={true}
        damping={10}
      />

      <CatmullRomLine
        points={pathPoints}
        closed={true}
        color="cyan"
        lineWidth={2}
        segments={100}
      />
    </>
  )
}

export const Default: Story = {
  render() {
    return (
      <>
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[5, 5, 5]} intensity={1} />
        <MotionPathScene />
      </>
    )
  },
}
