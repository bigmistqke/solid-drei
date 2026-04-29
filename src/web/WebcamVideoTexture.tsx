import { resolve } from '@/utils'
import type { AccessorMaybe } from '@/utils/types'
import { createMemo, onCleanup } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'

export interface WebcamVideoTextureOptions {
  colorSpace?: THREE.ColorSpace
}

export function useWebcamVideoTexture(
  constraints?: AccessorMaybe<MediaTrackConstraints | undefined>,
  options?: WebcamVideoTextureOptions,
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

    stream = await navigator.mediaDevices.getUserMedia({ video: constraintsValue ?? true, audio: false })
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
