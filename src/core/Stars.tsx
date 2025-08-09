import { defaultProps } from '@/utils/default-props'
import { type Ref, createMemo } from 'solid-js'
import { createT, Entity, useFrame } from 'solid-three'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Spherical,
  Vector3,
} from 'three'

const T = createT({ Points, BufferGeometry, BufferAttribute })

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function generateStar(r: number) {
  return new Vector3().setFromSpherical(
    new Spherical(r, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI),
  )
}

/**********************************************************************************/
/*                                                                                */
/*                               Star Field Material                              */
/*                                                                                */
/**********************************************************************************/

class StarfieldMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: { time: { value: 0.0 }, fade: { value: 1.0 } },
      vertexShader: /* glsl */ `
      uniform float time;
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
        gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
        gl_Position = projectionMatrix * mvPosition;
      }`,
      fragmentShader: /* glsl */ `
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <encodings_fragment>
      }`,
    })
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                      Star                                      */
/*                                                                                */
/**********************************************************************************/

type StarProps = {
  ref?: Ref<Points>
  radius?: number
  depth?: number
  count?: number
  factor?: number
  saturation?: number
  fade?: boolean
  speed?: number
}

export function Stars(props: StarProps) {
  const config = defaultProps(props, {
    radius: 100,
    depth: 50,
    count: 5000,
    saturation: 0,
    factor: 4,
    fade: false,
    speed: 1,
  })

  const starfieldMaterial = new StarfieldMaterial()

  const memo = createMemo(() => {
    const positions: any[] = []
    const colors: any[] = []
    const sizes = Array.from(
      { length: config.count },
      () => (0.5 + 0.5 * Math.random()) * config.factor,
    )
    const color = new Color()
    let r = config.radius + config.depth
    const increment = config.depth / config.count
    for (let i = 0; i < config.count; i++) {
      r -= increment * Math.random()
      positions.push(...generateStar(r).toArray())
      color.setHSL(i / config.count, config.saturation, 0.9)
      colors.push(color.r, color.g, color.b)
    }
    return {
      position: new Float32Array(positions),
      color: new Float32Array(colors),
      size: new Float32Array(sizes),
    }
  })

  useFrame(state => {
    starfieldMaterial.uniforms.time!.value = state.clock.getElapsedTime() * config.speed
  })

  return (
    <T.Points ref={config.ref}>
      <T.BufferGeometry>
        <T.BufferAttribute attach="attributes-position" args={[memo().position, 3]} />
        <T.BufferAttribute attach="attributes-color" args={[memo().color, 3]} />
        <T.BufferAttribute attach="attributes-size" args={[memo().size, 1]} />
      </T.BufferGeometry>
      <Entity
        from={starfieldMaterial}
        attach="material"
        blending={AdditiveBlending}
        uniforms-fade-value={config.fade}
        depthWrite={false}
        transparent
        vertexColors
      />
    </T.Points>
  )
}
