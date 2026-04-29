import { processProps } from '@/utils'
import type { JSX } from 'solid-js'
import { createEffect, createMemo } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { HalfFloatType, RGBAFormat, UnsignedByteType, WebGLRenderTarget } from 'three'
import { EffectComposer, GammaCorrectionShader, RenderPass, ShaderPass } from 'three-stdlib'

export const isWebGL2Available = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
  } catch (_e) {
    return false
  }
}

export type EffectsProps = {
  ref?: (api: EffectComposer) => void
  children?: JSX.Element
  multisamping?: number
  encoding?: number
  type?: number
  renderIndex?: number
  disableGamma?: boolean
  disableRenderPass?: boolean
  disableRender?: boolean
  depthBuffer?: boolean
  stencilBuffer?: boolean
  anisotropy?: number
}

export const Effects = (_props: EffectsProps) => {
  const [props] = processProps(
    _props,
    {
      multisamping: 8,
      renderIndex: 1,
      depthBuffer: true,
      stencilBuffer: false,
      anisotropy: 1,
    },
    [
      'ref',
      'children',
      'multisamping',
      'renderIndex',
      'disableRender',
      'disableGamma',
      'disableRenderPass',
      'depthBuffer',
      'stencilBuffer',
      'anisotropy',
      'encoding',
      'type',
    ],
  )

  const store = useThree()

  const target = createMemo(() => {
    const t = new WebGLRenderTarget(store.bounds.width, store.bounds.height, {
      type: (props.type as THREE.TextureDataType) || HalfFloatType,
      format: RGBAFormat,
      depthBuffer: props.depthBuffer,
      stencilBuffer: props.stencilBuffer,
    })
    // sRGB textures must be RGBA8 since r137 https://github.com/mrdoob/three.js/pull/23129
    if (props.type === UnsignedByteType && props.encoding != null) {
      if ('colorSpace' in t.texture) {
        ;(t.texture as unknown as { colorSpace: number }).colorSpace = props.encoding
      }
    }
    t.samples = props.multisamping
    return t
  })

  const composer = createMemo(() => {
    const c = new EffectComposer(store.gl, target())
    if (!props.disableRenderPass) {
      c.addPass(new RenderPass(store.scene, store.camera))
    }
    if (!props.disableGamma) {
      c.addPass(new ShaderPass(GammaCorrectionShader))
    }
    return c
  })

  createEffect(
    () => [store.bounds.width, store.bounds.height] as const,
    () => {
      composer().setSize(store.bounds.width, store.bounds.height)
    },
  )

  useFrame(
    () => {
      if (!props.disableRender) composer().render()
    },
    { priority: props.renderIndex },
  )

  createEffect(
    () => composer(),
    () => {
      props.ref?.(composer())
    },
  )

  return <>{props.children}</>
}
