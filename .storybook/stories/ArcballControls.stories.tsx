import { createPortal, useFrame } from 'solid-three'
import { Meta, StoryObj } from 'storybook-solidjs-vite'

import { Setup, T } from '../Setup'
import { ArcballControls, Box, PerspectiveCamera, Plane, useFBO } from '../../src'

import { Scene, type OrthographicCamera, type PerspectiveCamera as PerspectiveCameraType } from 'three'

const meta = {
  title: 'Controls/ArcballControls',
  component: ArcballControls,
  decorators: [
    (Story) => (
      <Setup controls={false}>
        <Story />
      </Setup>
    ),
  ],
  args: {
    enablePan: true,
    enableRotate: true,
    enableZoom: true,
  },
} satisfies Meta<typeof ArcballControls>

export default meta
type Story = StoryObj<typeof meta>

function DefaultScene(props: any) {
  return (
    <>
      <ArcballControls {...props} />
      <Box>
        <T.MeshBasicMaterial wireframe />
      </Box>
    </>
  )
}

export const Default: Story = {
  render: (args) => <DefaultScene {...args} />,
  name: 'Default',
}

const CustomCamera = (props: any) => {
  const fbo = useFBO(400, 400)
  let virtualCamera: PerspectiveCameraType = null!
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

      {createPortal(
        <>
          <Box>
            <T.MeshBasicMaterial wireframe />
          </Box>

          <PerspectiveCamera name="FBO Camera" ref={(ref: any) => (virtualCamera = ref)} position={[0, 0, 5]} />

          <ArcballControls camera={virtualCamera} {...props} />

          <T.Color attach="background" args={['hotpink']} />
        </>,
        virtualScene
      )}
    </>
  )
}

export const CustomCameraStory: Story = {
  render: (args) => <CustomCamera {...args} />,
  name: 'Custom Camera',
}
