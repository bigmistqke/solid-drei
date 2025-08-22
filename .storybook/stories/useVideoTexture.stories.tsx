import { createSignal, onMount, Suspense, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide, TextureLoader } from 'three'
import { Plane, useLoader, useVideoTexture } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Misc/useVideoTexture',
  decorators: [
    (Story: () => JSX.Element) => {
      return (
        <Setup defaultCamera={{ position: [0, 0, 5] }}>
          <Story />
        </Setup>
      )
    },
  ],
} satisfies Meta<typeof useVideoTexture>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                Use Video Texture                               */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  render() {
    const texture = useVideoTexture(
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    )

    return (
      <Suspense>
        <Plane args={[4, 2.25]} rotation={[0, 0, 0]}>
          <T.MeshBasicMaterial side={DoubleSide} map={texture()} toneMapped={false} />
        </Plane>
      </Suspense>
    )
  },
}

function FallbackMaterial(props: { url: string }) {
  const texture = useLoader(TextureLoader, () => props.url)
  return <T.MeshBasicMaterial map={texture()} toneMapped={false} />
}

function VideoMaterial({ src }: { src: string | MediaStream }) {
  const texture = useVideoTexture(src)
  return <T.MeshBasicMaterial side={DoubleSide} map={texture()} toneMapped={false} />
}

export const WithSuspense: Story = {
  render() {
    return (
      <Suspense fallback={null}>
        <Plane args={[4, 2.25]}>
          <Suspense fallback={<FallbackMaterial url="images/sintel-cover.jpg" />}>
            <VideoMaterial src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" />
          </Suspense>
        </Plane>
      </Suspense>
    )
  },
}

export const MediaStream: Story = {
  render() {
    const [mediaStream, setMediaStream] = createSignal<MediaStream | null>(null)

    onMount(async () => {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

      setMediaStream(mediaStream)
    })

    return (
      <Suspense fallback={null}>
        <Plane args={[4, 2.25]}>
          <Suspense fallback={<FallbackMaterial url="images/share-screen.jpg" />}>
            {mediaStream() && <VideoMaterial src={mediaStream()!} />}
          </Suspense>
        </Plane>
      </Suspense>
    )
  },
}
