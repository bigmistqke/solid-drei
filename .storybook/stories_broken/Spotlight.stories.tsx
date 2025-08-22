import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { MathUtils, TextureLoader, Vector3 } from 'three'
import {
  Circle,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  SpotLight,
  SpotLightShadow,
  useDepthBuffer,
  useLoader,
} from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Spotlight',
  component: SpotLight,
  decorators: [
    Story => (
      <Setup environment defaultCamera={{ position: new Vector3(0, 0, 3) }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Spotlight>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Spot Light                                  */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const depthBuffer = useDepthBuffer({ size: number('size', 256) })

    return (
      <>
        <SpotLight
          penumbra={0.5}
          depthBuffer={depthBuffer}
          position={[3, 2, 0]}
          intensity={0.5}
          angle={0.5}
          color="#ff005b"
          castShadow
        />
        <SpotLight
          penumbra={0.5}
          depthBuffer={depthBuffer}
          position={[-3, 2, 0]}
          intensity={0.5}
          angle={0.5}
          color="#0EEC82"
          castShadow
        />

        <T.Mesh position-y={0.5} castShadow>
          <T.BoxGeometry />
          <T.MeshPhongMaterial />
        </T.Mesh>

        <Plane receiveShadow rotation-x={-Math.PI / 2} args={[100, 100]}>
          <T.MeshPhongMaterial />
        </Plane>
      </>
    )
  },
}

export const Shadows: Story = {
  args: {
    debug: false,
    wind: true,
  },
  render(props) {
    const textures = useLoader(TextureLoader, {
      diffuse: '/textures/grassy_cobble/grassy_cobblestone_diff_2k.jpg',
      normal: '/textures/grassy_cobble/grassy_cobblestone_nor_gl_2k.jpg', //
      roughness: '/textures/grassy_cobble/grassy_cobblestone_rough_2k.jpg',
      ao: '/textures/grassy_cobble/grassy_cobblestone_ao_2k.jpg',
      leaf: '/textures/other/leaves.jpg',
    })
    return (
      <>
        <OrbitControls
          autoRotate={true}
          autoRotateSpeed={0.5}
          enabled
          maxDistance={10}
          minDistance={2}
        />
        <PerspectiveCamera far={50} fov={60} makeCurrent near={0.01} position={[1, 3, 1]} />

        <T.HemisphereLight args={[0xffffbb, 0x080820, 1]} />

        <Circle receiveShadow args={[5, 64, 64]} rotation-x={-Math.PI / 2}>
          <T.MeshStandardMaterial
            map={textures()?.diffuse} //
            normalMap={textures()?.normal}
            roughnessMap={textures()?.roughness}
            aoMap={textures()?.ao}
            envMapIntensity={0.2}
          />
        </Circle>

        <SpotLight
          distance={20}
          intensity={5}
          angle={MathUtils.degToRad(45)}
          color={'#fadcb9'}
          position={[5, 7, -2]}
          volumetric={false}
          debug={props.debug}
        >
          <SpotLightShadow
            scale={4}
            distance={0.4}
            width={2048}
            height={2048}
            map={textures()?.leaf}
            shader={
              props.wind
                ? /* glsl */ `
            varying vec2 vUv;
            uniform sampler2D uShadowMap;
            uniform float uTime;
            void main() {
              // material.repeat.set(2.5) - Since repeat is a shader feature not texture
              // we need to implement it manually
              vec2 uv = mod(vUv, 0.4) * 2.5;
              // Fake wind distortion
              uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.02;
              uv.y += sin(uv.x * 10.0 + uTime * 0.5) * 0.02;
              vec3 color = texture2D(uShadowMap, uv).xyz;
              gl_FragColor = vec4(color, 1.);
            }
          `
                : undefined
            }
          />
        </SpotLight>
      </>
    )
  },
}
