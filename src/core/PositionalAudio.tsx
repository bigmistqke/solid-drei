import { processProps } from '@/utils'
import { when } from '@/utils/conditionals'
import { type Ref, createEffect, createResource, onCleanup, onMount } from 'solid-js'
import { Entity, type S3, useThree } from 'solid-three'
import { AudioListener, AudioLoader, PositionalAudio as PositionalAudioImpl } from 'three'

interface PositionalAudioProps extends S3.Props<typeof PositionalAudioImpl> {
  ref?: Ref<PositionalAudioImpl>
  url: string
  distance?: number
  loop?: boolean
}

export function PositionalAudio(props: PositionalAudioProps) {
  const [config, rest] = processProps(
    props,
    {
      distance: 1,
      loop: true,
    },
    ['args', 'autoplay', 'distance', 'loop', 'ref', 'url'],
  )

  const listener = new AudioListener()
  const positionalAudio = new PositionalAudioImpl(listener)

  const store = useThree()
  const [buffer] = createResource<AudioBuffer, string>(
    () => config.url,
    url => new Promise((resolve, reject) => new AudioLoader().load(url, resolve, reject)),
  )

  createEffect(
    when(buffer, buffer => {
      positionalAudio.setBuffer(buffer)
      positionalAudio.setRefDistance(config.distance)
      positionalAudio.setLoop(config.loop)
      if (config.autoplay && !positionalAudio.isPlaying) {
        positionalAudio.play()
      }
    }),
  )

  onMount(() => store.currentCamera.add(listener))

  onCleanup(() => {
    store.currentCamera.remove(listener)
    if (positionalAudio.isPlaying) positionalAudio.stop()
    if (positionalAudio.source && (positionalAudio.source as any)._connected)
      positionalAudio.disconnect()
  })

  return <Entity from={positionalAudio} ref={positionalAudio!} {...rest} />
}
