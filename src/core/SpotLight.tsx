// SpotLight Inspired by http://john-chapman-graphics.blogspot.com/2013/01/good-enough-volumetrics-for-spotlights.html

import type { ParentProps } from 'solid-js'
import {
  Show,
  createContext,
  createMemo,
  createRenderEffect,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, createT, useFrame, useThree } from 'solid-three'
import {
  CylinderGeometry,
  DepthTexture,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  RGBAFormat,
  RepeatWrapping,
  ShaderMaterial,
  SpotLightHelper,
  SpotLight as SpotLightImpl,
  Texture,
  Vector3,
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three-stdlib'
import { SpotLightMaterial } from '../materials/SpotLightMaterial'
import { processProps, useRef } from '@/utils'
// @ts-ignore - GLSL ?raw import handled by bundler plugin
import SpotlightShadowShader from '@/utils/glsl/DefaultSpotlightShadowShadows.glsl?raw'

const T = createT({
  Group,
  SpotLight: SpotLightImpl,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  SpotLightHelper,
})

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function isSpotLight(child: Object3D | null): child is SpotLightImpl {
  return (child as SpotLightImpl)?.isSpotLight
}

function useCommon(arg: {
  spotlight: SpotLightImpl
  mesh: Mesh
  width: number
  height: number
  distance: number
}) {
  const [pos, dir] = [new Vector3(), new Vector3()]

  createRenderEffect(() => {
    if (isSpotLight(arg.spotlight)) {
      arg.spotlight.shadow.mapSize.set(arg.width, arg.height)
      arg.spotlight.shadow.needsUpdate = true
    } else {
      throw new Error('SpotlightShadow must be a child of a SpotLight')
    }
  })

  useFrame(() => {
    if (!arg.mesh) return

    const A = arg.spotlight.position
    const B = arg.spotlight.target.position

    dir.copy(B).sub(A)
    var len = dir.length()
    dir.normalize().multiplyScalar(len * arg.distance)
    pos.copy(A).add(dir)

    arg.mesh.position.copy(pos)
    arg.mesh.lookAt(arg.spotlight.target.position)
  })
}

/**********************************************************************************/
/*                                                                                */
/*                               Spot Light Context                               */
/*                                                                                */
/**********************************************************************************/

const spotLightContext = createContext<{ spotlight: SpotLightImpl; debug: boolean }>()
const useSpotLightContext = () => {
  const context = useContext(spotLightContext)
  if (!context) {
    throw 'SpotLightShadow should be sibling of SpotLight'
  }
  return context
}

/**********************************************************************************/
/*                                                                                */
/*                                 Volumetric Mesh                                */
/*                                                                                */
/**********************************************************************************/

interface VolumetricMeshProps extends S3.Props<typeof SpotLightImpl> {
  distance?: number
  angle?: number
  depthBuffer?: DepthTexture
  attenuation?: number
  anglePower?: number
  radiusTop?: number
  radiusBottom?: number
  opacity?: number
  color?: string | number
  debug?: boolean
}

function VolumetricMesh(props: VolumetricMeshProps) {
  const [config] = processProps(props, {
    opacity: 1,
    color: 'white',
    distance: 5,
    angle: 0.15,
    attenuation: 5,
    anglePower: 5,
  })

  let mesh: Mesh = null!
  const store = useThree()
  const material = new SpotLightMaterial()
  const vector = new Vector3()

  function radiusTop() {
    return config.radiusTop === undefined ? 0.1 : config.radiusTop
  }
  function radiusBottom() {
    return config.radiusBottom === undefined ? config.angle * 7 : config.radiusBottom
  }
  const geometry = createMemo(() => {
    const geometry = new CylinderGeometry(
      radiusTop(),
      radiusBottom(),
      config.distance,
      128,
      64,
      true,
    )
    geometry.applyMatrix4(new Matrix4().makeTranslation(0, -config.distance / 2, 0))
    geometry.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2))
    return geometry
  })

  useFrame(() => {
    material.uniforms.spotPosition!.value.copy(mesh.getWorldPosition(vector))
    mesh.lookAt((mesh.parent as any).target.getWorldPosition(vector))
  })

  return (
    <>
      <T.Mesh ref={mesh} geometry={geometry()} raycast={() => null}>
        <Entity
          from={material}
          attach="material"
          uniforms-opacity-value={config.opacity}
          uniforms-lightColor-value={config.color}
          uniforms-attenuation-value={config.attenuation}
          uniforms-anglePower-value={config.anglePower}
          uniforms-depth-value={config.depthBuffer}
          uniforms-cameraNear-value={store.camera.near}
          uniforms-cameraFar-value={store.camera.far}
          uniforms-resolution-value={
            config.depthBuffer
              ? [store.bounds.width * store.dpr, store.bounds.height * store.dpr]
              : [0, 0]
          }
        />
      </T.Mesh>
    </>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                Spot Light Shadow                               */
/*                                                                                */
/**********************************************************************************/

interface ShadowMeshProps extends ParentProps {
  distance?: number
  alphaTest?: number
  scale?: number
  map?: Texture
  shader?: string
  width?: number
  height?: number
}

export function SpotLightShadow(props: ShadowMeshProps) {
  const context = useSpotLightContext()
  return (
    <Show when={props.shader} fallback={<SpotlightShadowWithoutShader {...props} {...context} />}>
      <SpotlightShadowWithShader {...props} {...context} />
    </Show>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                             Spot Light With Shader                             */
/*                                                                                */
/**********************************************************************************/

interface SpotlightShadowWithShaderProps extends ShadowMeshProps {
  spotlight: SpotLightImpl
  debug: boolean
}

function SpotlightShadowWithShader(props: SpotlightShadowWithShaderProps) {
  const [config, rest] = processProps(
    props,
    {
      distance: 0.4,
      alphaTest: 0.5,
      shader: SpotlightShadowShader,
      width: 512,
      height: 512,
      scale: 1,
    },
    ['distance', 'alphaTest', 'map', 'shader', 'width', 'height', 'scale', 'children'],
  )

  let mesh: Mesh = null!
  const uniforms = {
    uShadowMap: {
      get value() {
        return config.map
      },
    },
    uTime: {
      value: 0,
    },
  }

  const renderTarget = createMemo(() => {
    const renderTarget = new WebGLRenderTarget(config.width, config.height, {
      format: RGBAFormat,
      stencilBuffer: false,
    })
    onCleanup(() => renderTarget.dispose())
    return renderTarget
  })

  const fsQuad = createMemo(() => {
    const fsQuad = new FullScreenQuad(
      new ShaderMaterial({
        uniforms,
        vertexShader: /* glsl */ `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
          `,
        fragmentShader: config.shader,
      }),
    )
    onCleanup(() => {
      fsQuad.material.dispose()
      fsQuad.dispose()
    })
    return fsQuad
  })

  onMount(() =>
    useCommon({
      mesh,
      get spotlight() {
        return rest.spotlight
      },
      get width() {
        return config.width
      },
      get height() {
        return config.height
      },
      get distance() {
        return config.distance
      },
    }),
  )

  useFrame(({ gl }, dt) => {
    uniforms.uTime.value += dt

    gl.setRenderTarget(renderTarget())
    fsQuad().render(gl)
    gl.setRenderTarget(null)
  })

  return (
    <T.Mesh ref={mesh} scale={config.scale} castShadow>
      <T.PlaneGeometry />
      <T.MeshBasicMaterial
        transparent
        side={DoubleSide}
        alphaTest={config.alphaTest}
        alphaMap={renderTarget().texture}
        alphaMap-wrapS={RepeatWrapping}
        alphaMap-wrapT={RepeatWrapping}
        opacity={rest.debug ? 1 : 0}
      >
        {config.children}
      </T.MeshBasicMaterial>
    </T.Mesh>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                        Spot Light Shadow Without Shader                        */
/*                                                                                */
/**********************************************************************************/

interface SpotlightShadowWithoutShaderProps extends ShadowMeshProps {
  spotlight: SpotLightImpl
  debug: boolean
}

function SpotlightShadowWithoutShader(props: SpotlightShadowWithoutShaderProps) {
  const [config, rest] = processProps(
    props,
    {
      distance: 0.4,
      alphaTest: 0.5,
      width: 512,
      height: 512,
    },
    ['distance', 'alphaTest', 'map', 'width', 'height', 'scale', 'children'],
  )

  let mesh: Mesh = null!

  onMount(() =>
    useCommon({
      mesh,
      get spotlight() {
        return rest.spotlight
      },
      get width() {
        return config.width
      },
      get height() {
        return config.height
      },
      get distance() {
        return config.distance
      },
    }),
  )

  return (
    <T.Mesh ref={mesh} scale={config.scale} castShadow>
      <T.PlaneGeometry />
      <T.MeshBasicMaterial
        transparent
        side={DoubleSide}
        alphaTest={config.alphaTest}
        alphaMap={config.map}
        alphaMap-wrapS={RepeatWrapping}
        alphaMap-wrapT={RepeatWrapping}
        opacity={rest.debug ? 1 : 0}
      >
        {config.children}
      </T.MeshBasicMaterial>
    </T.Mesh>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                                   Spot Light                                   */
/*                                                                                */
/**********************************************************************************/

interface SpotlightProps extends VolumetricMeshProps {
  volumetric?: boolean
}

function SpotLight(props: SpotlightProps) {
  const [config, rest] = processProps(
    props,
    {
      opacity: 1,
      color: 'white',
      distance: 5,
      angle: 0.15,
      attenuation: 5,
      anglePower: 5,
      volumetric: true,
      debug: false,
    },
    [
      'ref',
      'args',
      'opacity',
      'radiusTop',
      'radiusBottom',
      'depthBuffer',
      'color',
      'distance',
      'angle',
      'attenuation',
      'anglePower',
      'volumetric',
      'debug',
      'children',
    ],
  )

  const spotLight = new SpotLightImpl()

  useRef(config, spotLight)

  return (
    <T.Group>
      <Entity
        from={spotLight}
        angle={config.angle}
        color={config.color}
        distance={config.distance}
        castShadow
        {...rest}
      >
        <Show when={config.volumetric}>
          <VolumetricMesh
            debug={config.debug}
            opacity={config.opacity}
            radiusTop={config.radiusTop}
            radiusBottom={config.radiusBottom}
            depthBuffer={config.depthBuffer}
            color={config.color}
            distance={config.distance}
            angle={config.angle}
            attenuation={config.attenuation}
            anglePower={config.anglePower}
          />
        </Show>
      </Entity>
      <spotLightContext.Provider
        value={{
          spotlight: spotLight,
          get debug() {
            return config.debug
          },
        }}
      >
        {config.children}
      </spotLightContext.Provider>
      <T.SpotLightHelper args={[spotLight]} />
    </T.Group>
  )
}

export { SpotLight }
