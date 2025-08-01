import { Ref, createEffect, onCleanup, onMount } from 'solid-js'
import { S3, T, useLoader, useThree } from 'solid-three'
import { AudioListener, AudioLoader, PositionalAudio as PositionalAudioImpl } from 'three'
import { whenever } from '../utils/conditionals'
import { processProps } from '../utils/process-props'

interface PositionalAudioProps extends S3.Props<'PositionalAudio'> {
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
    ['ref', 'url', 'distance', 'loop', 'autoplay'],
  )
  let positionalAudio: PositionalAudioImpl

  const store = useThree()
  const buffer = useLoader(AudioLoader, () => config.url)
  const listener = new AudioListener()

  createEffect(
    whenever(buffer, buffer => {
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

  return <T.PositionalAudio ref={positionalAudio!} args={[listener]} {...rest} />
}
