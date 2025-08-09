import { createT, Entity, Portal, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from 'three'
import type { OrbitControlsProps } from '../../src'
import { Box, OrbitControls, Plane, useFBO } from '../../src'
import { Setup } from '../Setup'

const T = createT({ MeshBasicMaterial })

const meta = {
  title: 'Controls/OrbitControls',
  component: OrbitControls,
  decorators: [
    Story => (
      <Setup controls={false} cameraPosition={new Vector3(0, 0, 3)}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'OrbitControls enables mouse/touch-based camera controls for 3D scenes',
      },
    },
  },
  args: {
    enableDamping: true,
    enablePan: true,
    enableRotate: true,
    enableZoom: true,
    reverseOrbit: false,
  },
} satisfies Meta<typeof OrbitControls>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (props: OrbitControlsProps) => (
    <>
      <OrbitControls />
      <Box>
        <T.MeshBasicMaterial wireframe />
      </Box>
    </>
  ),
  name: 'Default',
}

const CustomCamera = (props: OrbitControlsProps) => {
  /**
   * we will render our scene in a render target and use it as a map.
   */
  const fbo = useFBO(400, 400)
  const virtualCamera = new PerspectiveCamera()
  const virtualScene = new Scene()

  useFrame(({ gl }) => {
    if (virtualCamera) {
      gl.setRenderTarget(fbo)
      gl.render(virtualScene, virtualCamera)

      gl.setRenderTarget(null)
    }
  })

  return (
    <>
      <Plane args={[4, 4, 4]}>
        <T.MeshBasicMaterial map={fbo.texture} />
      </Plane>
      <Portal element={virtualScene}>
        <Box>
          <T.MeshBasicMaterial wireframe />
        </Box>
        {/* s3f:  ref of PerspectiveCamera does not accept Camera */}
        <Entity from={virtualCamera} name="FBO Camera" position={[0, 0, 5]} />
        <OrbitControls camera={virtualCamera} {...props} />

        {/* @ts-ignore */}
        <T.Color attach="background" args={['hotpink']} />
      </Portal>
    </>
  )
}

export const CustomCameraStory: Story = {
  render: (props: OrbitControlsProps) => <CustomCamera {...props} />,
  name: 'Custom Camera',
}
