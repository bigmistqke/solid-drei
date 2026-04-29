import { createPortal, useFrame } from 'solid-three'
import { Meta, StoryObj } from 'storybook-solidjs-vite'

import { Setup, T } from '../Setup'
import { Box, CameraControls, CameraControlsImpl, PerspectiveCamera, Plane, useFBO } from '../../src'
import * as THREE from 'three'

const meta = {
  title: 'Controls/CameraControls',
  component: CameraControls,
} satisfies Meta<typeof CameraControls>

export default meta
type Story = StoryObj<typeof meta>

function CameraControlsScene1(props: any) {
  let cameraControlRef: any = null

  return (
    <Setup controls={false}>
      <CameraControls ref={(ref: any) => (cameraControlRef = ref)} {...props} />
      <Box
        onClick={() => {
          cameraControlRef?.rotate(Math.PI / 4, 0, true)
        }}
      >
        <T.MeshBasicMaterial wireframe />
      </Box>
    </Setup>
  )
}

export const Default: Story = {
  render: (args) => <CameraControlsScene1 {...args} />,
  name: 'Default',
}

const CameraControlsScene2 = (props: any) => {
  const fbo = useFBO(400, 400)
  let virtualCamera: THREE.PerspectiveCamera = null!
  const virtualScene = new THREE.Scene()
  let cameraControlRef: any = null!

  useFrame(({ gl }) => {
    if (virtualCamera) {
      gl.setRenderTarget(fbo)
      gl.render(virtualScene, virtualCamera)
      gl.setRenderTarget(null)
    }
  })

  return (
    <>
      <Plane
        args={[4, 4, 4]}
        onClick={() => {
          cameraControlRef?.rotate(Math.PI / 4, 0, true)
        }}
      >
        <T.MeshBasicMaterial map={fbo.texture} />
      </Plane>

      {createPortal(
        <>
          <Box>
            <T.MeshBasicMaterial wireframe />
          </Box>

          <PerspectiveCamera name="FBO Camera" ref={(ref: any) => (virtualCamera = ref)} position={[0, 0, 5]} />
          <CameraControls ref={(ref: any) => (cameraControlRef = ref)} camera={virtualCamera} {...props} />

          <T.Color attach="background" args={['hotpink']} />
        </>,
        virtualScene
      )}
    </>
  )
}

export const CustomCamera: Story = {
  render: (args) => (
    <Setup controls={false}>
      <CameraControlsScene2 {...args} />
    </Setup>
  ),
  name: 'Custom Camera',
}

function CameraControlsScene3(props: any) {
  let cameraControlRef: any = null

  return (
    <>
      <CameraControls
        ref={(ref: any) => (cameraControlRef = ref)}
        {...props}
      />
      <Box
        onClick={() => {
          cameraControlRef?.rotate(Math.PI / 4, 0, true)
        }}
      >
        <T.MeshBasicMaterial wireframe />
      </Box>
    </>
  )
}

export const FrameloopDemand: Story = {
  render: (args) => (
    <Setup
      controls={false}
      frameloop="demand"
    >
      <CameraControlsScene3 {...args} />
    </Setup>
  ),
  name: 'frameloop="demand"',
}

function CameraControlsScene4(props: any) {
  let cameraControlRef: any = null

  return (
    <Setup controls={false}>
      <CameraControls ref={(ref: any) => (cameraControlRef = ref)} {...props} />
      <Box
        onClick={() => {
          cameraControlRef?.rotate(Math.PI / 4, 0, true)
        }}
      >
        <T.MeshBasicMaterial wireframe />
      </Box>
    </Setup>
  )
}

class MyCameraControls extends CameraControlsImpl {
  override rotate(...args: Parameters<CameraControlsImpl['rotate']>) {
    console.log('rotate', ...args)
    return super.rotate(...args)
  }
}

export const Subclass: Story = {
  render: (args) => <CameraControlsScene4 impl={MyCameraControls} {...args} />,
  name: 'Subclass',
}
