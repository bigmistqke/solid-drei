import { processProps } from '@/utils'
import { createEffect, createMemo } from 'solid-js'
import { useThree, type S3 } from 'solid-three'
import * as THREE from 'three'

interface VideoTextureProps extends S3.Props<HTMLVideoElement> {
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

  return createMemo(
    () =>
      new Promise<THREE.VideoTexture>(resolve => {
        const video = (
          <video
            src={typeof src === 'string' && src}
            prop:srcObject={(src instanceof MediaStream && src) || undefined}
            crossorigin={props.crossOrigin as any}
            loop={props.loop}
            muted={props.muted}
            {...rest}
          />
        ) as unknown as HTMLVideoElement

        const texture = new THREE.VideoTexture(video)

        createEffect(
          () => props.start,
          start => start && texture.image.play(),
        )

        if ('colorSpace' in texture) {
          texture.colorSpace = store.gl.outputColorSpace
        } else {
          // @ts-expect-error
          texture.encoding = store.gl.outputEncoding
        }

        video.addEventListener(props.unsuspend, () => resolve(texture))
      }),
  )
}
