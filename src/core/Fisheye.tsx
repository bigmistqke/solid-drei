/**
 * Fisheye component — renders the scene through 6 cube faces and reprojects
 * them into a fisheye (equirectangular-like) projection using a fullscreen quad
 * with a custom GLSL shader.
 *
 * Based on drei's Fisheye implementation.
 */
import { defaultProps } from '@/utils'
import { onSettled } from 'solid-js'
import type { JSX } from 'solid-js'
import { Entity, useFrame, useThree } from 'solid-three'
import { CubeCamera, HalfFloatType, ShaderMaterial, WebGLCubeRenderTarget } from 'three'
import { ScreenQuad } from './ScreenQuad'

/**********************************************************************************/
/*                                                                                */
/*                                    Shader                                      */
/*                                                                                */
/**********************************************************************************/

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform samplerCube tCube;
  uniform vec2 resolution;
  uniform float zoom;

  void main() {
    vec2 uv = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;

    float r = length(uv);
    if (r > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Fisheye lens: equidistant projection
    float theta = r * (3.14159265359 / 2.0) / zoom;
    float phi = atan(uv.y, uv.x);

    vec3 dir = vec3(
      sin(theta) * cos(phi),
      sin(theta) * sin(phi),
      cos(theta)
    );

    gl_FragColor = textureCube(tCube, dir);
  }
`

/**********************************************************************************/
/*                                                                                */
/*                                    Fisheye                                     */
/*                                                                                */
/**********************************************************************************/

export interface FisheyeProps {
  /** Zoom factor, default 1 */
  zoom?: number
  /** Resolution of the cube render target, default 512 */
  resolution?: number
  /** Scene children to render through the fisheye lens */
  children?: JSX.Element
}

export function Fisheye(_props: FisheyeProps) {
  const props = defaultProps(_props, {
    zoom: 1,
    resolution: 512,
  })

  const store = useThree()

  // Create the cube render target
  const fbo = new WebGLCubeRenderTarget(props.resolution)
  fbo.texture.type = HalfFloatType
  onSettled(() => () => fbo.dispose())

  // Create the cube camera
  const cubeCamera = new CubeCamera(0.1, 1000, fbo)

  // Create the fullscreen shader material
  const material = new ShaderMaterial({
    uniforms: {
      tCube: { value: fbo.texture },
      resolution: { value: [store.bounds.width, store.bounds.height] },
      zoom: { value: props.zoom },
    },
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  })
  onSettled(() => () => material.dispose())

  // Render the cube camera every frame, then update uniforms
  useFrame(() => {
    material.uniforms.resolution!.value = [store.bounds.width, store.bounds.height]
    material.uniforms.zoom!.value = props.zoom

    const prevBackground = store.scene.background
    store.scene.background = null
    cubeCamera.update(store.gl, store.scene)
    store.scene.background = prevBackground
  })

  return (
    <>
      {/* Render the scene children normally so cube camera can capture them */}
      <Entity from={cubeCamera} />
      {props.children}
      {/* Fullscreen quad that reprojects cube to fisheye */}
      <ScreenQuad>
        <Entity from={material} />
      </ScreenQuad>
    </>
  )
}
