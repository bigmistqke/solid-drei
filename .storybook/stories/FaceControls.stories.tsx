/* eslint react-hooks/exhaustive-deps: 1 */
import * as THREE from 'three'
import { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as easing from 'maath/easing'

import { Setup, T } from '../Setup'

import { FaceLandmarker, FaceControls, Box, WebcamVideoTexture } from '../../src'
import { ComponentRef, createEffect, createSignal, onCleanup } from 'solid-js'
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import { useFrame, useThree } from 'solid-three'

const meta = {
  title: 'Controls/FaceControls',
  component: FaceControls,
  decorators: [
    (Story) => (
      <Setup cameraFov={60}>
        <Story />
      </Setup>
    ),
  ],
  tags: ['!autodocs'],
} satisfies Meta<typeof FaceControls>

export default meta
type Story = StoryObj<typeof meta>

function FaceControlsScene(props: any) {
  return (
    <>
      <T.Color attach="background" args={['#303030']} />
      <axesHelper />

      <Suspense fallback={null}>
        <FaceLandmarker>
          <FaceControls {...props} />
        </FaceLandmarker>
      </Suspense>

      <Box args={[0.1, 0.1, 0.1]}>
        <T.MeshStandardMaterial />
      </Box>
    </>
  )
}

export const Default: Story = {
  render: (args) => <FaceControlsScene {...args} />,
  name: 'Default',
}

function FaceControlsScene2(props: any) {
  let faceLandmarkerRef: any = null
  let videoTextureRef: any = null

  const [faceLandmarkerResult, setFaceLandmarkerResult] = createSignal<FaceLandmarkerResult>()

  return (
    <>
      <T.Color attach="background" args={['#303030']} />
      <axesHelper />

      <Suspense fallback={null}>
        <FaceLandmarker ref={(ref: any) => (faceLandmarkerRef = ref)}>
          <WebcamVideoTexture
            ref={(ref: any) => (videoTextureRef = ref)}
            onVideoFrame={(now: number) => {
              const faceLandmarker = faceLandmarkerRef
              const videoTexture = videoTextureRef
              if (!faceLandmarker || !videoTexture) return

              const videoFrame = videoTexture.source.data
              const result = faceLandmarker.detectForVideo(videoFrame, now)
              setFaceLandmarkerResult(result)
            }}
          />

          <FaceControls {...props} manualDetect faceLandmarkerResult={faceLandmarkerResult()} />
        </FaceLandmarker>
      </Suspense>

      <Box args={[0.1, 0.1, 0.1]}>
        <T.MeshStandardMaterial />
      </Box>
    </>
  )
}

export const ManualDetect: Story = {
  render: (args) => <FaceControlsScene2 {...args} />,
  name: 'manualDetect',
}

function FaceControlsScene3(props: any) {
  let faceControlsRef: any = null

  const camera = useThree((state: any) => state.camera)
  const current = new THREE.Object3D()

  useFrame((_, delta) => {
    const target = faceControlsRef?.computeTarget()

    if (target) {
      const eps = 1e-9
      easing.damp3(current.position, target.position, 0.25, delta, undefined, undefined, eps)
      easing.dampE(current.rotation, target.rotation, 0.25, delta, undefined, undefined, eps)
      camera.position.copy(current.position)
      camera.rotation.copy(current.rotation)
    }
  })

  return (
    <>
      <T.Color attach="background" args={['#303030']} />
      <axesHelper />

      <Suspense fallback={null}>
        <FaceLandmarker>
          <FaceControls ref={(ref: any) => (faceControlsRef = ref)} {...props} manualUpdate />
        </FaceLandmarker>
      </Suspense>

      <Box args={[0.1, 0.1, 0.1]}>
        <T.MeshStandardMaterial />
      </Box>
    </>
  )
}

export const ManualUpdate: Story = {
  render: (args) => <FaceControlsScene3 {...args} />,
  name: 'manualUpdate',
}
