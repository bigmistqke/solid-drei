// The author of the original code is @mrdoob https://twitter.com/mrdoob
// https://threejs.org/examples/?q=con#webgl_shadow_contact

import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { createT, Entity, useFrame, useThree } from 'solid-three'
import {
  Color,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  WebGLRenderTarget,
  type ColorRepresentation,
} from 'three'
import { HorizontalBlurShader, VerticalBlurShader } from 'three-stdlib'

const T = createT({ Group, Mesh, OrthographicCamera, MeshBasicMaterial })

function transform(value: number, scale: [number, number] | number | undefined) {
  return value * (Array.isArray(scale) ? scale[1] : scale ?? 1)
}

export interface ContactShadowsProps extends Omit<S3.Props<Group>, 'scale'> {
  ref?: Ref<Group>
  opacity?: number
  width?: number
  height?: number
  blur?: number
  near?: number
  far?: number
  smooth?: boolean
  resolution?: number
  frames?: number
  scale?: number | [x: number, y: number]
  color?: ColorRepresentation
  depthWrite?: boolean
}

export function ContactShadows(props: ContactShadowsProps) {
  const [config, rest] = processProps(
    props,
    {
      scale: 10,
      frames: Infinity,
      opacity: 1,
      width: 1,
      height: 1,
      blur: 1,
      near: 0,
      far: 10,
      resolution: 512,
      smooth: true,
      color: '#000000',
      depthWrite: false,
    },
    [
      'ref',
      'scale',
      'frames',
      'opacity',
      'width',
      'height',
      'blur',
      'near',
      'far',
      'resolution',
      'smooth',
      'color',
      'depthWrite',
      'renderOrder',
    ],
  )

  const store = useThree()

  const group = new Group()
  const width = () => transform(config.width, config.scale)
  const height = () => transform(config.height, config.scale)

  const shadowCamera = createMemo(
    () =>
      new OrthographicCamera(
        -width() / 2,
        width() / 2,
        height() / 2,
        -height() / 2,
        config.near,
        config.far,
      ),
  )

  const shadow = createMemo(() => {
    const renderTarget = new WebGLRenderTarget(config.resolution, config.resolution)
    const renderTargetBlur = new WebGLRenderTarget(config.resolution, config.resolution)
    renderTargetBlur.texture.generateMipmaps = renderTarget.texture.generateMipmaps = false

    const planeGeometry = new PlaneGeometry(
      transform(config.width, config.scale),
      height(),
    ).rotateX(Math.PI / 2)
    const blurPlane = new Mesh(planeGeometry)

    const depthMaterial = new MeshDepthMaterial()
    depthMaterial.depthTest = depthMaterial.depthWrite = false
    depthMaterial.onBeforeCompile = shader => {
      shader.uniforms = {
        ...shader.uniforms,
        ucolor: { value: new Color(config.color) },
      }
      shader.fragmentShader = shader.fragmentShader.replace(
        `void main() {`, //
        `uniform vec3 ucolor;
           void main() {
          `,
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4( vec3( 1.0 - fragCoordZ ), opacity );',
        // Colorize the shadow, multiply by the falloff so that the center can remain darker
        'vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );',
      )
    }

    const horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader)
    const verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader)
    verticalBlurMaterial.depthTest = horizontalBlurMaterial.depthTest = false

    return {
      renderTarget,
      planeGeometry,
      depthMaterial,
      blurPlane,
      horizontalBlurMaterial,
      verticalBlurMaterial,
      renderTargetBlur,
    }
  })

  function blurShadows(blur: number) {
    shadow().blurPlane.visible = true

    shadow().blurPlane.material = shadow().horizontalBlurMaterial
    shadow().horizontalBlurMaterial.uniforms.tDiffuse!.value = shadow().renderTarget.texture
    shadow().horizontalBlurMaterial.uniforms.h!.value = (blur * 1) / 256

    store.gl.setRenderTarget(shadow().renderTargetBlur)
    store.gl.render(shadow().blurPlane, shadowCamera())

    shadow().blurPlane.material = shadow().verticalBlurMaterial
    shadow().verticalBlurMaterial.uniforms.tDiffuse!.value = shadow().renderTargetBlur.texture
    shadow().verticalBlurMaterial.uniforms.v!.value = (blur * 1) / 256

    store.gl.setRenderTarget(shadow().renderTarget)
    store.gl.render(shadow().blurPlane, shadowCamera())

    shadow().blurPlane.visible = false
  }

  let count = 0
  let initialBackground: Color | Texture | null
  let initialOverrideMaterial: Material | null
  useFrame(() => {
    if (config.frames === Infinity || count < config.frames) {
      count++

      initialBackground = store.scene.background
      initialOverrideMaterial = store.scene.overrideMaterial

      group.visible = false
      store.scene.background = null
      store.scene.overrideMaterial = shadow().depthMaterial

      store.gl.setRenderTarget(shadow().renderTarget)
      store.gl.render(store.scene, shadowCamera())

      blurShadows(config.blur)
      if (config.smooth) blurShadows(config.blur * 0.4)
      store.gl.setRenderTarget(null)

      group.visible = true
      store.scene.overrideMaterial = initialOverrideMaterial
      store.scene.background = initialBackground
    }
  })

  useRef(config, group)

  return (
    <Entity from={group} rotation-x={Math.PI / 2} {...rest}>
      <T.Mesh
        renderOrder={config.renderOrder}
        geometry={shadow().planeGeometry}
        scale={[1, -1, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <T.MeshBasicMaterial
          transparent
          map={shadow().renderTarget.texture}
          opacity={config.opacity}
          depthWrite={config.depthWrite}
        />
      </T.Mesh>
      <Entity from={shadowCamera()} />
    </Entity>
  )
}
