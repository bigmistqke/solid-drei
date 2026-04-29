import { createMemo, onCleanup } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'

export interface ScreenVideoTextureOptions {
  colorSpace?: THREE.ColorSpace
}

export function useScreenVideoTexture(
  constraints?: DisplayMediaStreamOptions,
  options?: ScreenVideoTextureOptions,
) {
  const store = useThree()

  const texture = createMemo(async () =>
    navigator.mediaDevices
      .getDisplayMedia(constraints)
      .then(stream => {
        const video = document.createElement('video')
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        video.autoplay = true

        const texture = new THREE.VideoTexture(video)
        if (options?.colorSpace !== undefined) {
          texture.colorSpace = options.colorSpace
        } else if ('colorSpace' in texture) {
          texture.colorSpace = store.gl.outputColorSpace
        } else {
          // @ts-expect-error legacy encoding
          texture.encoding = store.gl.outputEncoding
        }

        video.play()

        onCleanup(() => {
          stream.getTracks().forEach(track => track.stop())
          video.srcObject = null
          texture.dispose()
        })

        return texture
      }),
  )

  return texture
}
