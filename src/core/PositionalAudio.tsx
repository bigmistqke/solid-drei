import { when } from '@/utils/conditionals'
import { processProps } from '@/utils/process-props'
import { type Ref, createEffect, onCleanup, onMount } from 'solid-js'
import { type S3, useLoader, useThree } from 'solid-three'
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
  const buffer = useLoader(AudioLoader, () => config.url)

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

  onMount(() => store.camera.add(listener))

  onCleanup(() => {
    store.camera.remove(listener)
    if (positionalAudio.isPlaying) positionalAudio.stop()
    if (positionalAudio.source && (positionalAudio.source as any)._connected)
      positionalAudio.disconnect()
  })

  return <Entity from={positionalAudio} ref={positionalAudio!} {...rest} />
}
