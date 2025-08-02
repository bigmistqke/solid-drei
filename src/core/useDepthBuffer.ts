import { createMemo } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import { DepthFormat, DepthTexture, UnsignedShortType } from 'three'
import { useFBO } from './unported/useFBO.tsx'

export function useDepthBuffer({
  size = 256,
  frames = Infinity,
}: { size?: number; frames?: number } = {}) {
  const store = useThree()
  let count = 0

  const w = () => size || store.bounds.width * store.dpr
  const h = () => size || store.bounds.height * store.dpr

  const depthConfig = createMemo(() => {
    const depthTexture = new DepthTexture(w(), h())
    depthTexture.format = DepthFormat
    depthTexture.type = UnsignedShortType
    return { depthTexture }
  })

  const depthFBO = useFBO(w, h, depthConfig)

  useFrame(state => {
    if (frames === Infinity || count < frames) {
      state.gl.setRenderTarget(depthFBO)
      state.gl.render(state.scene, state.camera)
      state.gl.setRenderTarget(null)
      count++
    }
  })

  return depthFBO.depthTexture
}
