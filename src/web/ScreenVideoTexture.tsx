import { resolve } from '@/utils'
import type { AccessorMaybe } from '@/utils/types'
import { createMemo, onCleanup } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'

export interface ScreenVideoTextureOptions {
  colorSpace?: THREE.ColorSpace
}

export function useScreenVideoTexture(
  constraints?: AccessorMaybe<DisplayMediaStreamOptions | undefined>,
  options?: ScreenVideoTextureOptions,
) {
  const store = useThree()

  const texture = createMemo(async () => {
    const constraintsValue = resolve(constraints)

    let stream: MediaStream | undefined
    let tex: THREE.VideoTexture | undefined
    let disposed = false

    onCleanup(() => {
      disposed = true
      stream?.getTracks().forEach(t => t.stop())
      tex?.dispose()
    })

    stream = await navigator.mediaDevices.getDisplayMedia(constraintsValue)
    if (disposed) { stream.getTracks().forEach(t => t.stop()); return undefined }

    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    video.autoplay = true

    tex = new THREE.VideoTexture(video)
    if (options?.colorSpace !== undefined) {
      tex.colorSpace = options.colorSpace
    } else if ('colorSpace' in tex) {
      tex.colorSpace = store.gl.outputColorSpace
    } else {
      // @ts-expect-error legacy encoding
      tex.encoding = store.gl.outputEncoding
    }

    video.play()
    return tex
  })

  return texture
}
