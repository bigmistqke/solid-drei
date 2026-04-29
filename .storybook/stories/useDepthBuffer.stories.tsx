import { createMemo, createEffect } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { Setup } from '../Setup'
import { useDepthBuffer } from '../../src'

const meta = {
  title: 'Misc/useDepthBuffer',
  component: useDepthBuffer,
  decorators: [
    Story => (
      <Setup cameraPosition={new Vector3(0, 0, 5)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof useDepthBuffer>

export default meta
type Story = StoryObj<typeof meta>

function DepthBufferScene() {
  const depthTexture = useDepthBuffer({ size: 512 })

  const [material, setMaterial] = createSignal<THREE.ShaderMaterial>()

  createEffect(() => {
    if (!depthTexture) return
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        depthTexture: { value: depthTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D depthTexture;
        varying vec2 vUv;
        void main() {
          float depth = texture2D(depthTexture, vUv).r;
          gl_FragColor = vec4(vec3(depth), 1.0);
        }
      `,
    })
    setMaterial(mat)
  })

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh position={[-2, 0, 2]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
      <mesh position={[2, 0, -1]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      {material() && (
        <mesh position={[0, 0, -3]}>
          <planeGeometry args={[3, 3]} />
          <T.ShaderMaterial ref={material()} />
        </mesh>
      )}
    </>
  )
}

export const Default: Story = {
  render() {
    return <DepthBufferScene />
  },
  name: 'Default',
}
