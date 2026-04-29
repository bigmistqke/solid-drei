import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector3 } from 'three'
import { Setup, Html } from '../Setup'
import { useIntersect } from '../../src'

const meta = {
  title: 'Misc/useIntersect',
  component: useIntersect,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useIntersect>

export default meta
type Story = StoryObj<typeof meta>

function UseIntersectScene() {
  const [visible, setVisible] = createSignal(false)
  const [ref, setRef] = useIntersect<THREE.Mesh>((v) => setVisible(v))

  return (
    <>
      <mesh ref={setRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={visible() ? 'hotpink' : 'gray'} />
      </mesh>
      <T.Mesh position={[0, -3, 0]}>
        <T.PlaneGeometry args={[10, 10]} />
        <T.MeshBasicMaterial color="#303030" />
      </T.Mesh>
      <T.Mesh position={[0, 0, -3]}>
        <T.PlaneGeometry args={[10, 10]} />
        <T.MeshBasicMaterial color="#505050" />
      </T.Mesh>
      <Html position={[0, 3, 0]} center>
        <div style={{ color: 'white', 'font-size': '20px' }}>
          {visible() ? 'Visible (in scene)' : 'Not visible'}
        </div>
      </Html>
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseIntersectScene />
  },
  name: 'Default',
}
