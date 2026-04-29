import { type Accessor, createRenderEffect } from 'solid-js'
import { autodispose, useThree } from 'solid-three'
import * as THREE from 'three'

type FBOSettings = {
  /** Defines the count of MSAA samples. Can only be used with WebGL 2. Default: 0 */
  samples?: number
  /** If set, the scene depth will be rendered into buffer.depthTexture. Default: false */
  depth?: boolean
} & THREE.RenderTargetOptions

export function useFBO(
  /** Width in pixels, or settings (will render fullscreen by default) */
  width?: Accessor<number> | number | FBOSettings,
  /** Height in pixels */
  height?: Accessor<number> | number,
  /**Settings */
  settings?: FBOSettings,
): THREE.WebGLRenderTarget {
  const store = useThree()

  const _width = () =>
    typeof width === 'number'
      ? width
      : typeof width === 'function'
      ? width()
      : store.bounds.width * (store.dpr ?? 1)
  const _height = () =>
    typeof height === 'number'
      ? height
      : typeof height === 'function'
      ? height()
      : store.bounds?.height && (store.dpr ?? 1)
      ? store.bounds.height * (store.dpr ?? 1)
      : 0

  const _settings = () =>
    (typeof settings !== 'undefined' ? settings : (width as FBOSettings)) || {}

  const { samples = 0, depth, ...targetSettings } = _settings()

  const target = autodispose(
    new THREE.WebGLRenderTarget(_width(), _height(), {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      ...targetSettings,
    }),
  )

  if (depth) {
    target.depthTexture = new THREE.DepthTexture(_width(), _height(), THREE.FloatType)
  }

  target.samples = samples

  createRenderEffect(
    () => [_width(), _height()] as const,
    ([w, h]) => {
      target.setSize(w, h)
      if (samples) target.samples = samples
    }
  )

  return target
}
