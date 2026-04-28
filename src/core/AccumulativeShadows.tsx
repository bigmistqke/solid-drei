import { DiscardMaterial } from '@/materials/DiscardMaterial'
import { shaderMaterial } from '@/materials/shaderMaterial'
import { processProps, useRef } from '@/utils'
import { version } from '@/utils/constants'
import type { Ref } from 'solid-js'
import {
  createContext,
  createEffect,
  createMemo,
  Index,
  on,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { Entity, type S3, useFrame, useThree } from 'solid-three'
import {
  Color,
  type ColorRepresentation,
  DirectionalLight,
  Group,
  HalfFloatType,
  Light,
  Material,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

function isLight(object: any): object is Light {
  return object.isLight
}

function isGeometry(object: any): object is Mesh {
  return !!object.geometry
}

export type AccumulativeShadowsProps = {
  /** How many frames it can render, more yields cleaner results but takes more time, 40 */
  frames?: number
  /** If frames === Infinity blend controls the refresh ratio, 100 */
  blend?: number
  /** Can limit the amount of frames rendered if frames === Infinity, usually to get some performance back once a movable scene has settled, Infinity */
  limit?: number
  /** Scale of the plane,  */
  scale?: number
  /** Temporal accumulates shadows over time which is more performant but has a visual regression over instant results, false  */
  temporal?: boolean
  /** Opacity of the plane, 1 */
  opacity?: number
  /** Discards alpha pixels, 0.65 */
  alphaTest?: number
  /** Shadow color, black */
  color?: ColorRepresentation
  /** Colorblend, how much colors turn to black, 0 is black, 2 */
  colorBlend?: number
  /** Buffer resolution, 1024 */
  resolution?: number
  /** Texture tonemapping */
  toneMapped?: boolean
}

interface AccumulativeContext {
  lights: Map<any, any>
  temporal: boolean
  frames: number
  blend: number
  count: number
  /** Returns the plane geometry onto which the shadow is cast */
  getMesh: () => Mesh<PlaneGeometry, SoftShadowMaterialProps & ShaderMaterial>
  /** Resets the buffers, starting from scratch */
  reset: () => void
  /** Updates the lightmap for a number of frames accumulartively */
  update: (frames?: number) => void
}

interface AccumulativeLightContext {
  /** Jiggles the lights */
  update: () => void
}

type SoftShadowMaterialProps = {
  map: Texture
  color?: S3.Color
  alphaTest?: number
  blend?: number
}

export const accumulativeContext = createContext<AccumulativeContext>(
  null as unknown as AccumulativeContext,
)

const SoftShadowMaterial = /* @__PURE__ */ shaderMaterial(
  {
    color: /* @__PURE__ */ new Color(),
    blend: 2.0,
    alphaTest: 0.75,
    opacity: 0,
    map: null,
  },
  `varying vec2 vUv;
   void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
     vUv = uv;
   }`,
  `varying vec2 vUv;
   uniform sampler2D map;
   uniform vec3 color;
   uniform float opacity;
   uniform float alphaTest;
   uniform float blend;
   void main() {
     vec4 sampledDiffuseColor = texture2D(map, vUv);
     gl_FragColor = vec4(color * sampledDiffuseColor.r * blend, max(0.0, (1.0 - (sampledDiffuseColor.r + sampledDiffuseColor.g + sampledDiffuseColor.b) / alphaTest)) * opacity);
     #include <tonemapping_fragment>
     #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
   }`,
)

export function AccumulativeShadows(
  props: S3.Props<typeof Group> & AccumulativeShadowsProps & { ref?: Ref<AccumulativeContext> },
) {
  const [config, rest] = processProps(
    props,
    {
      frames: 40,
      limit: Infinity,
      blend: 20,
      scale: 10,
      opacity: 1,
      alphaTest: 0.75,
      color: 'black',
      colorBlend: 2,
      resolution: 1024,
      toneMapped: true,
    },
    [
      'ref',
      'children',
      'temporal',
      'frames',
      'limit',
      'blend',
      'scale',
      'opacity',
      'alphaTest',
      'color',
      'colorBlend',
      'resolution',
      'toneMapped',
    ],
  )

  const store = useThree()

  const lights: Group = new Group()
  const plane: Mesh<PlaneGeometry, SoftShadowMaterialProps & ShaderMaterial> = new Mesh()

  const plm = createMemo(() => new ProgressiveLightMap(store.gl, store.scene, config.resolution))

  const api = {
    lights: new Map(),
    get temporal() {
      return !!config.temporal
    },
    get frames() {
      return Math.max(2, config.frames)
    },
    get blend() {
      return Math.max(2, config.frames === Infinity ? config.blend : config.frames)
    },
    count: 0,
    getMesh() {
      return plane
    },
    reset() {
      // Clear buffers, reset opacities, set frame count to 0
      plm().clear()
      const material = plane.material
      material.opacity = 0
      material.alphaTest = 0
      api.count = 0
    },
    update(frames = 1) {
      // Adapt the opacity-blend ratio to the number of frames
      const material = plane.material

      if (!api.temporal) {
        material.opacity = config.opacity
        material.alphaTest = config.alphaTest
      } else {
        material.opacity = Math.min(config.opacity, material.opacity + config.opacity / api.blend)
        material.alphaTest = Math.min(
          config.alphaTest,
          material.alphaTest + config.alphaTest / api.blend,
        )
      }

      // Switch accumulative lights on
      lights.visible = true
      // Collect scene lights and meshes
      plm().prepare()

      // Update the lightmap and the accumulative lights
      for (let i = 0; i < frames; i++) {
        api.lights.forEach(light => light.update())

        plm().update(store.camera, api.blend)
      }
      // Switch lights off
      lights.visible = false
      // Restore lights and meshes
      plm().finish()
    },
  }

  // Expose api, allow children to set itself as the main light source
  useFrame(() => {
    if (
      // (api.temporal || api.frames === Infinity) &&
      api.count < api.frames &&
      api.count < config.limit
    ) {
      // store.requestRender()
      api.update()
      api.count++
    }
  })

  createEffect(() => {
    const _plm = plm()
    _plm.configure(plane)

    onCleanup(() => {
      // Clean up render targets
      _plm.progressiveLightMap1.dispose()
      _plm.progressiveLightMap2.dispose()
    })
  })

  createEffect(
    on(
      // Track dependencies that should trigger a reset
      () => [config.frames, config.blend, config.limit, config.temporal, config.resolution],
      () => {
        // Reset internals, buffers, ...
        api.reset()
        if (!api.temporal && api.frames !== Infinity) api.update(api.blend)
      },
    ),
  )

  useRef(config, api)

  return (
    <Entity from={Group} {...rest}>
      <Entity traverse={() => null} from={lights}>
        <accumulativeContext.Provider value={api}>{config.children}</accumulativeContext.Provider>
      </Entity>
      <Entity from={plane} receiveShadow scale={config.scale} rotation={[-Math.PI / 2, 0, 0]}>
        <Entity from={new PlaneGeometry()} />
        <Entity
          from={SoftShadowMaterial}
          transparent
          depthWrite={false}
          toneMapped={config.toneMapped}
          color={config.color}
          blend={config.colorBlend}
          map={plm().progressiveLightMap2.texture}
        />
      </Entity>
    </Entity>
  )
}

export type RandomizedLightProps = {
  /** How many frames it will jiggle the lights, 1.
   *  Frames is context aware, if a provider like AccumulativeShadows exists, frames will be taken from there!  */
  frames?: number
  /** Light position, [0, 0, 0] */
  position?: [x: number, y: number, z: number]
  /** Radius of the jiggle, higher values make softer light, 5 */
  radius?: number
  /** Amount of lights, 8 */
  amount?: number
  /** Light intensity, 1 */
  intensity?: number
  /** Ambient occlusion, lower values mean less AO, hight more, you can mix AO and directional light, 0.5 */
  ambient?: number
  /** If the lights cast shadows, this is true by default */
  castShadow?: boolean
  /** Default shadow bias, 0 */
  bias?: number
  /** Default map size, 512 */
  mapSize?: number
  /** Default size of the shadow camera, 10 */
  size?: number
  /** Default shadow camera near, 0.5 */
  near?: number
  /** Default shadow camera far, 500 */
  far?: number
}

export function RandomizedLight(
  props: S3.Props<Group> & RandomizedLightProps & { ref?: Ref<AccumulativeLightContext> },
) {
  const [config, rest] = processProps(
    props,
    {
      castShadow: true,
      bias: 0.001,
      mapSize: 512,
      size: 5,
      near: 0.5,
      far: 500,
      frames: 1,
      position: [0, 0, 0],
      radius: 1,
      amount: 8,
      intensity: version >= 155 ? Math.PI : 1,
      ambient: 0.5,
    },
    [
      'ref',
      'castShadow',
      'bias',
      'mapSize',
      'size',
      'near',
      'far',
      'frames',
      'position',
      'radius',
      'amount',
      'intensity',
      'ambient',
    ],
  )

  const lightGroup: Group = new Group()
  const length = new Vector3(...config.position).length()

  // s3f:   should parent be reactive?
  const parent = useContext(accumulativeContext)

  const api: AccumulativeLightContext = {
    update() {
      let light: Object3D | undefined
      for (let l = 0; l < lightGroup.children.length; l++) {
        light = lightGroup.children[l]
        if (Math.random() > config.ambient) {
          light.position.set(
            config.position[0] + MathUtils.randFloatSpread(config.radius),
            config.position[1] + MathUtils.randFloatSpread(config.radius),
            config.position[2] + MathUtils.randFloatSpread(config.radius),
          )
        } else {
          let lambda = Math.acos(2 * Math.random() - 1) - Math.PI / 2.0
          let phi = 2 * Math.PI * Math.random()
          light.position.set(
            Math.cos(lambda) * Math.cos(phi) * length,
            Math.abs(Math.cos(lambda) * Math.sin(phi) * length),
            Math.sin(lambda) * length,
          )
        }
      }
    },
  }

  useRef(config, api)

  onMount(() => {
    if (parent) {
      parent.lights.set(lightGroup.uuid, api)
    }
    onCleanup(() => void parent.lights.delete(lightGroup.uuid))
  })

  return (
    <Entity from={lightGroup} {...rest}>
      <Index each={Array.from({ length: config.amount })}>
        {() => (
          <Entity
            from={DirectionalLight}
            castShadow={config.castShadow}
            shadow-bias={config.bias}
            shadow-mapSize={[config.mapSize, config.mapSize]}
            intensity={config.intensity / config.amount}
          >
            <Entity
              from={OrthographicCamera}
              args={[-config.size, config.size, config.size, -config.size, config.near, config.far]}
              attach="shadow-camera"
            />
          </Entity>
        )}
      </Index>
    </Entity>
  )
}

// Based on "Progressive Light Map Accumulator", by [zalo](https://github.com/zalo/)
class ProgressiveLightMap {
  renderer: WebGLRenderer
  res: number
  scene: Scene
  object: Mesh | null
  buffer1Active: boolean
  progressiveLightMap1: WebGLRenderTarget
  progressiveLightMap2: WebGLRenderTarget
  discardMat: ShaderMaterial
  targetMat: MeshLambertMaterial
  previousShadowMap: { value: Texture }
  averagingWindow: { value: number }
  clearColor: Color
  clearAlpha: number
  lights: { object: Light; intensity: number }[]
  meshes: { object: Mesh; material: Material | Material[] }[]

  constructor(renderer: WebGLRenderer, scene: Scene, res: number = 1024) {
    this.renderer = renderer
    this.res = res
    this.scene = scene
    this.buffer1Active = false
    this.lights = []
    this.meshes = []
    this.object = null
    this.clearColor = new Color()
    this.clearAlpha = 0

    // Create the Progressive LightMap Texture
    const textureParams = {
      type: HalfFloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
    }
    this.progressiveLightMap1 = new WebGLRenderTarget(this.res, this.res, textureParams)
    this.progressiveLightMap2 = new WebGLRenderTarget(this.res, this.res, textureParams)

    // Inject some spicy new logic into a standard phong material
    this.discardMat = new DiscardMaterial()
    this.targetMat = new MeshLambertMaterial({ fog: false })
    this.previousShadowMap = { value: this.progressiveLightMap1.texture }
    this.averagingWindow = { value: 100 }
    this.targetMat.onBeforeCompile = shader => {
      // Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
      shader.vertexShader =
        'varying vec2 vUv;\n' +
        shader.vertexShader.slice(0, -1) +
        'vUv = uv; gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }'

      // Fragment Shader: Set Pixels to average in the Previous frame's Shadows
      const bodyStart = shader.fragmentShader.indexOf('void main() {')
      shader.fragmentShader =
        'varying vec2 vUv;\n' +
        shader.fragmentShader.slice(0, bodyStart) +
        'uniform sampler2D previousShadowMap;\n	uniform float averagingWindow;\n' +
        shader.fragmentShader.slice(bodyStart - 1, -1) +
        `\nvec3 texelOld = texture2D(previousShadowMap, vUv).rgb;
        gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, 1.0/ averagingWindow);
      }`

      // Set the Previous Frame's Texture Buffer and Averaging Window
      shader.uniforms.previousShadowMap = this.previousShadowMap
      shader.uniforms.averagingWindow = this.averagingWindow
    }
  }

  clear() {
    this.renderer.getClearColor(this.clearColor)
    this.clearAlpha = this.renderer.getClearAlpha()
    this.renderer.setClearColor('black', 1)
    this.renderer.setRenderTarget(this.progressiveLightMap1)
    this.renderer.clear()
    this.renderer.setRenderTarget(this.progressiveLightMap2)
    this.renderer.clear()
    this.renderer.setRenderTarget(null)
    this.renderer.setClearColor(this.clearColor, this.clearAlpha)

    this.lights = []
    this.meshes = []
    this.scene.traverse(object => {
      if (isGeometry(object)) {
        this.meshes.push({ object, material: object.material })
      } else if (isLight(object)) {
        this.lights.push({ object, intensity: object.intensity })
      }
    })
  }

  prepare() {
    this.lights.forEach(light => (light.object.intensity = 0))
    this.meshes.forEach(mesh => (mesh.object.material = this.discardMat))
  }

  finish() {
    this.lights.forEach(light => (light.object.intensity = light.intensity))
    this.meshes.forEach(mesh => (mesh.object.material = mesh.material))
  }

  configure(object) {
    this.object = object
  }

  update(camera, blendWindow = 100) {
    if (!this.object) return
    // Set each object's material to the UV Unwrapped Surface Mapping Version
    this.averagingWindow.value = blendWindow
    this.object.material = this.targetMat
    // Ping-pong two surface buffers for reading/writing
    const activeMap = this.buffer1Active ? this.progressiveLightMap1 : this.progressiveLightMap2
    const inactiveMap = this.buffer1Active ? this.progressiveLightMap2 : this.progressiveLightMap1
    // Render the object's surface maps
    const oldBg = this.scene.background
    this.scene.background = null
    this.renderer.setRenderTarget(activeMap)
    this.previousShadowMap.value = inactiveMap.texture
    this.buffer1Active = !this.buffer1Active
    this.renderer.render(this.scene, camera)
    this.renderer.setRenderTarget(null)
    this.scene.background = oldBg
  }
}
