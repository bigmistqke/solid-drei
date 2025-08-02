import { createEffect, createResource } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'
import { processProps } from '@/utils/process-props'

interface VideoTextureProps extends HTMLVideoElement {
  unsuspend?: 'canplay' | 'canplaythrough' | 'loadstart' | 'loadedmetadata'
  start?: boolean
}

export function useVideoTexture(src: string | MediaStream, _props?: Partial<VideoTextureProps>) {
  const [props, rest] = processProps(
    _props || {},
    {
      unsuspend: 'loadedmetadata',
      crossOrigin: 'Anonymous',
      muted: true,
      loop: true,
      start: true,
      playsInline: true,
    },
    ['unsuspend', 'crossOrigin', 'muted', 'loop', 'start', 'playsInline'],
  )

  const store = useThree()
  const [texture] = createResource(
    [src],
    () =>
      new Promise<THREE.VideoTexture>(resolve => {
        const video = Object.assign(document.createElement('video'), {
          src: (typeof src === 'string' && src) || undefined,
          srcObject: (src instanceof MediaStream && src) || undefined,
          crossOrigin: props.crossOrigin,
          loop: props.loop,
          muted: props.muted,
          ...rest,
        })
        const texture = new THREE.VideoTexture(video)
        if ('colorSpace' in texture) {
          texture.colorSpace = store.gl.outputColorSpace
        } else {
          // @ts-expect-error
          texture.encoding = store.gl.outputEncoding
        }

        video.addEventListener(props.unsuspend, () => resolve(texture))
      }),
  )
  createEffect(() => props.start && texture()?.image.play())
  return texture
}
