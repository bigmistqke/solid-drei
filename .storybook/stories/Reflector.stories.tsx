import { createMemo, Suspense } from 'solid-js'
import { useFrame } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Vector2, Vector3 } from 'three'
import { /* Environment, */ Box, MeshReflectorMaterial, TorusKnot, useTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Shaders/MeshReflectorMaterial',
  component: MeshReflectorMaterial,
  decorators: [
    Story => (
      <Setup environment defaultCamera={{ fov: 20, position: new Vector3(-2, 2, 6) }}>
        <T.Color args={['white']} attach="background" />
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Stats',
      },
    },
  },
} satisfies Meta<typeof MeshReflectorMaterial>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Gizmo Helper                                */
/*                                                                                */
/**********************************************************************************/

/* s3f:   - blur-example not working 
          - distortion-example not working
          - `Feedback loop formed between Framebuffer and active Texture.`-error          
*/
function ReflectorScene(props: {
  resolution?: number
  blur?: [number, number]
  depthScale?: number
  distortion?: number
  normalScale?: number
  reflectorOffset?: number
}) {
  console.log('MOUT!')

  const roughness = useTexture(() => 'roughness_floor.jpeg')
  const normal = useTexture(() => 'NORM.jpg')
  const distortionMap = useTexture(() => 'dist_map.jpeg')
  const _normalScale = createMemo(() => new Vector2(props.normalScale || 0), [props.normalScale])

  // whenEffect(distortionMap, distortionMap => {
  //   distortionMap.wrapS = distortionMap.wrapT = RepeatWrapping
  //   distortionMap.repeat.set(4, 4)
  // })

  return (
    <>
      <T.Mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <T.PlaneGeometry args={[10, 10]} />
        <MeshReflectorMaterial
          resolution={props.resolution ?? 1024}
          mirror={1}
          mixBlur={10}
          // mixStrength={2}
          blur={props.blur || [0, 0]}
          // minDepthThreshold={0.8}
          // maxDepthThreshold={1.2}
          // depthScale={props.depthScale || 0}
          // depthToBlurRatioBias={0.2}
          /* debug={0} */
          // distortion={props.distortion || 0}
          distortionMap={distortionMap()}
          color="#a0a0a0"
          // metalness={0.5}
          roughnessMap={roughness()}
          // roughness={1}
          // normalMap={normal()}
          // normalScale={_normalScale()}
          // reflectorOffset={props.reflectorOffset}
        />
      </T.Mesh>

      <Box args={[2, 3, 0.2]} position={[0, 1.6, -3]}>
        <T.MeshPhysicalMaterial color="hotpink" />
      </Box>
      <TorusKnot
        args={[0.5, 0.2, 128, 32]}
        ref={torusKnot =>
          useFrame(({ clock }) => {
            torusKnot.position.y += Math.sin(clock.getElapsedTime()) / 25
            torusKnot.rotation.y = clock.getElapsedTime() / 2
          })
        }
        position={[0, 1, 0]}
      >
        <T.MeshPhysicalMaterial color="hotpink" />
      </TorusKnot>
      <T.SpotLight intensity={1} position={[10, 6, 10]} penumbra={1} angle={0.3} />
    </>
  )
}

export const Default: Story = {
  render() {
    return (
      <Suspense>
        <ReflectorScene blur={[100, 500]} depthScale={2} distortion={0.3} normalScale={0.5} />
      </Suspense>
    )
  },
}

export const Plain: Story = {
  render() {
    return <ReflectorScene />
  },
}

export const Blur: Story = {
  args: {
    resolution: 1024,
    blur: 500,
  },
  render(props) {
    return <ReflectorScene {...props} />
  },
}

export const Depth: Story = {
  render() {
    return (
      <Suspense>
        <ReflectorScene depthScale={2} />
      </Suspense>
    )
  },
}

export const Distortion: Story = {
  render() {
    return (
      <Suspense>
        <ReflectorScene distortion={1} />
      </Suspense>
    )
  },
}

export const NormalMap: Story = {
  render() {
    return (
      <Suspense>
        <ReflectorScene normalScale={0.5} />
      </Suspense>
    )
  },
}

export const Offset: Story = {
  render() {
    return (
      <Suspense>
        <ReflectorScene reflectorOffset={1} />
      </Suspense>
    )
  },
}
