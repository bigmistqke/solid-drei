import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import { type Accessor, createMemo, type Ref, Show } from 'solid-js'
import { createT, type S3, useFrame, useThree } from 'solid-three'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  type ColorRepresentation,
  MathUtils,
  Points,
  Vector2,
  Vector3,
  Vector4,
} from 'three'
import { shaderMaterial } from '../../materials/shaderMaterial'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function expandColor(v: Color) {
  return [v.r, v.g, v.b]
}

function isVector(v: any): v is Vector2 | Vector3 | Vector4 {
  return v instanceof Vector2 || v instanceof Vector3 || v instanceof Vector4
}

function isFloat32Array(def: any): def is Float32Array {
  return def && (def as Float32Array).constructor === Float32Array
}

function normalizeVector(v: any): number[] {
  if (Array.isArray(v)) return v
  else if (isVector(v)) return v.toArray()
  return [v, v, v] as number[]
}

function usePropAsIsOrAsAttribute<T extends any>(
  getCount: Accessor<number>,
  getProp: Accessor<T | Float32Array | undefined>,
  setDefault?: (v: T) => number,
) {
  return createMemo(() => {
    const count = getCount()
    const prop = getProp?.()

    if (prop === undefined) {
      return Float32Array.from({ length: count }, setDefault!)
    }
    if (isFloat32Array(prop)) {
      return prop as Float32Array
    }
    if (prop instanceof Color) {
      const a = Array.from({ length: count * 3 }, () => expandColor(prop)).flat()
      return Float32Array.from(a)
    }
    if (isVector(prop) || Array.isArray(prop)) {
      const a = Array.from({ length: count * 3 }, () => normalizeVector(prop)).flat()
      return Float32Array.from(a)
    }
    return Float32Array.from({ length: count }, () => prop as number)
  })
}

/**********************************************************************************/
/*                                                                                */
/*                             Sparkles Impl Material                             */
/*                                                                                */
/**********************************************************************************/

const SparklesImplMaterial = shaderMaterial(
  { time: 0, pixelRatio: 1 },
  ` uniform float pixelRatio;
    uniform float time;
    attribute float size;  
    attribute float speed;  
    attribute float opacity;
    attribute vec3 noise;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
      modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
      modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPostion = projectionMatrix * viewPosition;
      gl_Position = projectionPostion;
      gl_PointSize = size * 25. * pixelRatio;
      gl_PointSize *= (1.0 / - viewPosition.z);
      vColor = color;
      vOpacity = opacity;
    }`,
  ` varying vec3 vColor;
    varying float vOpacity;
    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      float strength = 0.05 / distanceToCenter - 0.1;
      gl_FragColor = vec4(vColor, strength * vOpacity);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`,
)

const T = createT({
  SparklesImplMaterial,
  Points,
  BufferGeometry,
  BufferAttribute,
})

/**********************************************************************************/
/*                                                                                */
/*                                    Sparkles                                    */
/*                                                                                */
/**********************************************************************************/

export interface SparklesProps extends S3.Props<Points> {
  ref: Ref<Points>
  /** Number of particles (default: 100) */
  count?: number
  /** Speed of particles (default: 1) */
  speed?: number | Float32Array
  /** Opacity of particles (default: 1) */
  opacity?: number | Float32Array
  /** Color of particles (default: 100) */
  color?: ColorRepresentation | Float32Array
  /** Size of particles (default: randomized between 0 and 1) */
  size?: number | Float32Array
  /** The space the particles occupy (default: 1) */
  scale?: number | [number, number, number] | Vector3
  /** Movement factor (default: 1) */
  noise?: number | [number, number, number] | Vector3 | Float32Array
}

export function Sparkles(props: SparklesProps) {
  const [config, rest] = processProps(
    props,
    {
      noise: 1,
      count: 100,
      speed: 1,
      opacity: 1,
      scale: 1,
    },
    ['ref', 'noise', 'count', 'speed', 'opacity', 'scale', 'size', 'color', 'children'],
  )

  let points: Points = null!
  const store = useThree()

  const positions = createMemo(() =>
    Float32Array.from(
      Array.from({ length: config.count }, () =>
        normalizeVector(config.scale).map(MathUtils.randFloatSpread),
      ).flat(),
    ),
  )

  const sizes = usePropAsIsOrAsAttribute<number>(
    () => config.count,
    () => config.size,
    Math.random,
  )
  const opacities = usePropAsIsOrAsAttribute<number>(
    () => config.count,
    () => config.opacity,
  )
  const speeds = usePropAsIsOrAsAttribute<number>(
    () => config.count,
    () => config.speed,
  )
  const noises = usePropAsIsOrAsAttribute<typeof config.noise>(
    () => config.count * 3,
    () => config.noise,
  )
  const colors = usePropAsIsOrAsAttribute<ColorRepresentation>(
    () => (config.color === undefined ? config.count * 3 : config.count),
    () => (!isFloat32Array(config.color) ? new Color(config.color) : config.color),
    () => 1,
  )

  useFrame(state => {
    // TODO: implement store.clock in solid-three
    if (points && points.material) (points.material as any).time = state.clock.elapsedTime
  })

  useRef(props, points)

  return (
    <T.Points {...rest}>
      <T.BufferGeometry>
        <T.BufferAttribute attach="attributes-position" args={[positions(), 3]} />
        <T.BufferAttribute attach="attributes-size" args={[sizes(), 1]} />
        <T.BufferAttribute attach="attributes-opacity" args={[opacities(), 1]} />
        <T.BufferAttribute attach="attributes-speed" args={[speeds(), 1]} />
        <T.BufferAttribute attach="attributes-color" args={[colors(), 3]} />
        <T.BufferAttribute attach="attributes-noise" args={[noises(), 3]} />
      </T.BufferGeometry>
      <Show
        when={config.children}
        fallback={<T.SparklesImplMaterial transparent pixelRatio={store.dpr} depthWrite={false} />}
      >
        {config.children}
      </Show>
    </T.Points>
  )
}
