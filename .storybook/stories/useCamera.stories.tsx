import { createSignal, createMemo, ComponentProps } from 'solid-js'
import { useFrame, useThree, createPortal } from 'solid-three'
import * as THREE from 'three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Setup } from '../Setup'
import { useCamera, OrthographicCamera } from '../../src'

function UseCameraScene() {
  let virtualCam: THREE.OrthographicCamera = null!
  let ref: THREE.Mesh = null!

  const [hover, setHover] = createSignal<null | number>(null)

  const gl = useThree(({ gl }) => gl)
  const scene = useThree(({ scene }) => scene)
  const camera = useThree(({ camera }) => camera)

  const virtualScene = createMemo(() => new THREE.Scene())

  const matrix = new THREE.Matrix4()

  useFrame(() => {
    matrix.copy(camera.matrix).invert()

    if (ref) {
      ref.quaternion.setFromRotationMatrix(matrix)
    }

    gl.autoClear = true
    gl.render(scene, camera)

    gl.autoClear = false
    gl.clearDepth()
    gl.render(virtualScene(), virtualCam)
  }, 1)

  const handlePointerOut = () => setHover(null)
  const handlePointerMove = (e: any) => setHover(Math.floor(e.faceIndex ?? 0 / 2))
  return createPortal(
    <>
      <OrthographicCamera ref={virtualCam} makeDefault={false} position={[0, 0, 100]} zoom={2} />

      <mesh ref={ref} raycast={useCamera(virtualCam)} onPointerOut={handlePointerOut} onPointerMove={handlePointerMove}>
        {[...Array(6)].map((_, index) => (
          <meshLambertMaterial key={index} color="hotpink" wireframe={hover() !== index} />
        ))}
        <boxGeometry args={[60, 60, 60]} />
      </mesh>

      <ambientLight intensity={0.5 * Math.PI} />
      <pointLight position={[10, 10, 10]} intensity={0.5 * Math.PI} decay={0} />
    </>,
    virtualScene()
  )
}

const meta = {
  title: 'Misc/useCamera',
  component: UseCameraScene,
  decorators: [
    Story => (
      <Setup cameraPosition={new THREE.Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof UseCameraScene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render() {
    return <UseCameraScene />
  },
  name: 'Default',
}
