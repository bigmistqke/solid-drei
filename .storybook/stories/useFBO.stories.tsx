import { createMemo } from 'solid-js'
import { Entity, Portal, useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Box, TorusKnot, useFBO } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useFBO',
  component: useFBO,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Use Fbo',
      },
    },
  },
} satisfies Meta<typeof useFBO>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                      Use Fbo                                   */
/*                                                                                */
/**********************************************************************************/

function SpinningThing() {
  let mesh: THREE.Mesh = null!
  useFrame(() => {
    mesh.rotation.x = mesh.rotation.y = mesh.rotation.z += 0.01
  })
  return (
    <TorusKnot ref={mesh!} args={[1, 0.4, 100, 64]}>
      <T.MeshNormalMaterial />
    </TorusKnot>
  )
}

function UseFBOScene({ color = 'orange', ...props }) {
  const camera = new THREE.PerspectiveCamera()
  const target = useFBO(props)

  const scene = createMemo(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(color)
    return scene
  })

  useFrame(state => {
    camera.position.z = 5 + Math.sin(state.clock.getElapsedTime() * 1.5) * 2
    state.gl.setRenderTarget(target)
    state.gl.render(scene(), camera)
    state.gl.setRenderTarget(null)
  })

  return (
    <>
      <Entity from={camera} position={[0, 0, 3]} />
      <Portal element={scene()}>
        <SpinningThing />
      </Portal>
      <Box args={[3, 3, 3]}>
        <T.MeshStandardMaterial map={target.texture} />
      </Box>
    </>
  )
}

export const Default: Story = {
  render() {
    return <UseFBOScene />
  },
}

export const WithSettings: Story = {
  render() {
    return (
      <UseFBOScene
        color="blue"
        multisample
        samples={8}
        stencilBuffer={false}
        // format={THREE.RGBFormat}
      />
    )
  },
}
