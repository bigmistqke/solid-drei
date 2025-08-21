import { Entity, Portal, useFrame, useThree } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide, PerspectiveCamera, Scene } from 'three'
import type { OrbitControlsOptions } from '../../src'
import { Box, Plane, useFBO, useOrbitControls } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Controls/OrbitControls',
  component: useOrbitControls,
  decorators: [
    Story => (
      <Setup controls={false} defaultCamera={{ position: [0, 0, 3] }}>
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
} satisfies Meta<typeof useOrbitControls>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                  Orbit Controls                                */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render: (props: OrbitControlsOptions) => {
    useOrbitControls(useThree())
    return (
      <Box>
        <T.MeshBasicMaterial wireframe />
      </Box>
    )
  },
  name: 'Default',
}

const CustomCamera = (props: OrbitControlsOptions) => {
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
      <Plane args={[4, 4, 4]} ref={useTurntable()}>
        <T.MeshBasicMaterial map={fbo.texture} side={DoubleSide} />
      </Plane>
      <Portal element={virtualScene}>
        <Entity from={virtualCamera} name="FBO Camera" position={[0, 0, 5]} />
        {(() => {
          useOrbitControls(useThree(), { camera: virtualCamera })
          return null!
        })()}
        <Box /* ref={useTurntable()} */>
          <T.MeshBasicMaterial wireframe />
        </Box>
        {/* s3f:  ref of PerspectiveCamera does not accept Camera */}

        {/* @ts-ignore */}
        {/* <T.Color attach="background" args={['hotpink']} /> */}
      </Portal>
    </>
  )
}

export const CustomCameraStory: Story = {
  render: (props: OrbitControlsOptions) => <CustomCamera {...props} />,
  name: 'Custom Camera',
}
